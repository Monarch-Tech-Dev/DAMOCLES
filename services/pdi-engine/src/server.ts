import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cron from 'node-cron';
import { PDICalculationEngine, FinancialMetrics } from './PDICalculationEngine';
import { PDIAutomationEngine } from './PDIAutomationEngine';
import { RegionalPDIAggregator } from './RegionalPDIAggregator';
import { DAMOCLESIntegration } from './DAMOCLESIntegration';

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Initialize services
const regionalAggregator = new RegionalPDIAggregator();
const damoclesIntegration = new DAMOCLESIntegration();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'pdi-engine',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Calculate PDI for a user
app.post('/api/pdi/calculate', async (req, res) => {
  try {
    const { userId, financialMetrics } = req.body;

    if (!userId || !financialMetrics) {
      return res.status(400).json({
        error: 'Missing required fields: userId and financialMetrics'
      });
    }

    // Validate financial metrics
    const requiredFields = ['monthlyIncome', 'totalDebt', 'monthlyDebtPayments', 'fixedExpenses', 'variableExpenses', 'emergencyFund'];
    for (const field of requiredFields) {
      if (typeof financialMetrics[field] !== 'number') {
        return res.status(400).json({
          error: `Invalid or missing field: ${field}`
        });
      }
    }

    // Process PDI update through DAMOCLES integration
    const result = await damoclesIntegration.processPDIUpdate(userId, financialMetrics);

    res.json({
      success: true,
      result
    });

  } catch (error) {
    console.error('PDI calculation error:', error);
    res.status(500).json({
      error: 'Failed to calculate PDI',
      message: error.message
    });
  }
});

// Get PDI statistics for a user
app.get('/api/pdi/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const statistics = await damoclesIntegration.getPDIStatistics(userId);

    if (statistics.error) {
      return res.status(404).json(statistics);
    }

    res.json(statistics);

  } catch (error) {
    console.error('PDI statistics error:', error);
    res.status(500).json({
      error: 'Failed to retrieve PDI statistics',
      message: error.message
    });
  }
});

// Bulk process PDI updates
app.post('/api/pdi/bulk-calculate', async (req, res) => {
  try {
    const { userUpdates } = req.body;

    if (!Array.isArray(userUpdates)) {
      return res.status(400).json({
        error: 'userUpdates must be an array'
      });
    }

    const results = await damoclesIntegration.bulkProcessPDIUpdates(userUpdates);

    res.json({
      success: true,
      processed: results.length,
      results
    });

  } catch (error) {
    console.error('Bulk PDI calculation error:', error);
    res.status(500).json({
      error: 'Failed to process bulk PDI updates',
      message: error.message
    });
  }
});

// Get national PDI data (public endpoint)
app.get('/api/public/pdi/national', async (req, res) => {
  try {
    const nationalData = await regionalAggregator.getCachedNationalData(false);

    if (!nationalData) {
      return res.status(503).json({
        error: 'National PDI data not available',
        message: 'Please try again in a few minutes'
      });
    }

    res.json(nationalData);

  } catch (error) {
    console.error('National PDI data error:', error);
    res.status(500).json({
      error: 'Failed to retrieve national PDI data',
      message: error.message
    });
  }
});

// Get regional PDI data
app.get('/api/pdi/regional/:regionCode', async (req, res) => {
  try {
    const { regionCode } = req.params;
    const regionalData = await regionalAggregator.getCachedRegionalData(regionCode);

    if (!regionalData) {
      return res.status(404).json({
        error: 'Regional data not found',
        region: regionCode
      });
    }

    res.json(regionalData);

  } catch (error) {
    console.error('Regional PDI data error:', error);
    res.status(500).json({
      error: 'Failed to retrieve regional PDI data',
      message: error.message
    });
  }
});

// Get regions in crisis
app.get('/api/pdi/crises', async (req, res) => {
  try {
    const crises = await regionalAggregator.getRegionsInCrisis();
    res.json(crises);

  } catch (error) {
    console.error('Crisis data error:', error);
    res.status(500).json({
      error: 'Failed to retrieve crisis data',
      message: error.message
    });
  }
});

// Manual trigger for regional aggregation
app.post('/api/pdi/aggregate', async (req, res) => {
  try {
    const nationalData = await regionalAggregator.aggregateRegionalData();

    res.json({
      success: true,
      message: 'Regional aggregation completed',
      data: {
        nationalAverage: nationalData.nationalAverage,
        totalUsers: nationalData.totalUsers,
        regionsProcessed: nationalData.regions.length
      }
    });

  } catch (error) {
    console.error('Manual aggregation error:', error);
    res.status(500).json({
      error: 'Failed to run regional aggregation',
      message: error.message
    });
  }
});

// Test PDI calculation endpoint
app.post('/api/pdi/test-calculate', async (req, res) => {
  try {
    const testMetrics: FinancialMetrics = {
      monthlyIncome: req.body.monthlyIncome || 45000,
      totalDebt: req.body.totalDebt || 850000,
      monthlyDebtPayments: req.body.monthlyDebtPayments || 15000,
      fixedExpenses: req.body.fixedExpenses || 20000,
      variableExpenses: req.body.variableExpenses || 8000,
      emergencyFund: req.body.emergencyFund || 30000,
      debtGrowthRate: req.body.debtGrowthRate || 0,
      missedPayments: req.body.missedPayments || 0
    };

    const pdiScore = PDICalculationEngine.calculatePDI(testMetrics);

    res.json({
      success: true,
      input: testMetrics,
      result: pdiScore
    });

  } catch (error) {
    console.error('Test PDI calculation error:', error);
    res.status(500).json({
      error: 'Failed to test PDI calculation',
      message: error.message
    });
  }
});

// WebSocket handling for real-time updates
io.on('connection', (socket) => {
  console.log('Client connected to PDI stream:', socket.id);

  // Send current national data immediately
  regionalAggregator.getCachedNationalData(false).then(data => {
    if (data) {
      socket.emit('national_update', data);
    }
  });

  socket.on('subscribe_region', async (regionCode) => {
    console.log(`Client ${socket.id} subscribed to region: ${regionCode}`);

    const regionalData = await regionalAggregator.getCachedRegionalData(regionCode);
    if (regionalData) {
      socket.emit('regional_update', regionalData);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Schedule automatic regional aggregation every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  try {
    console.log('🔄 Running scheduled regional PDI aggregation...');
    const nationalData = await regionalAggregator.aggregateRegionalData();

    // Broadcast update to all connected clients
    io.emit('national_update', {
      nationalAverage: nationalData.nationalAverage,
      totalUsers: nationalData.totalUsers,
      criticalPercentage: nationalData.criticalPercentage,
      totalDebtStress: nationalData.totalDebtStress,
      timestamp: Date.now()
    });

    console.log('✅ Regional PDI aggregation completed successfully');
  } catch (error) {
    console.error('❌ Scheduled aggregation failed:', error);
  }
});

// Error handling middleware
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path
  });
});

// Start server
const PORT = process.env.PORT || 8011;

server.listen(PORT, () => {
  console.log(`🚀 PDI Engine server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔥 WebSocket: ws://localhost:${PORT}`);
  console.log(`📈 Public API: http://localhost:${PORT}/api/public/pdi/national`);

  // Start regional aggregation on startup
  setTimeout(async () => {
    try {
      console.log('🔄 Running initial regional PDI aggregation...');
      await regionalAggregator.aggregateRegionalData();
      console.log('✅ Initial aggregation completed');
    } catch (error) {
      console.error('❌ Initial aggregation failed:', error);
    }
  }, 5000);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('📴 Shutting down PDI Engine server...');

  try {
    await regionalAggregator.cleanup();
    server.close(() => {
      console.log('🔚 Server closed');
      process.exit(0);
    });
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

export default app;
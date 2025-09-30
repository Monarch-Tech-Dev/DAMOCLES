const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static('.'));

// Email collection endpoint
app.post('/api/subscribe', (req, res) => {
    const { email } = req.body;

    if (!email || !isValidEmail(email)) {
        return res.status(400).json({
            success: false,
            message: 'Ugyldig e-postadresse'
        });
    }

    // Save email to file (in production, use a proper database)
    const emailData = {
        email,
        timestamp: new Date().toISOString(),
        source: 'coming-soon-page'
    };

    try {
        const filePath = path.join(__dirname, 'email-subscribers.json');
        let subscribers = [];

        // Read existing subscribers
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            subscribers = JSON.parse(data);
        }

        // Check if email already exists
        const existingEmail = subscribers.find(sub => sub.email === email);
        if (existingEmail) {
            return res.json({
                success: true,
                message: 'Du er allerede registrert!'
            });
        }

        // Add new subscriber
        subscribers.push(emailData);

        // Save back to file
        fs.writeFileSync(filePath, JSON.stringify(subscribers, null, 2));

        console.log(`New subscriber: ${email}`);

        res.json({
            success: true,
            message: 'Takk! Du vil få beskjed når DAMOCLES lanseres.'
        });

    } catch (error) {
        console.error('Error saving email:', error);
        res.status(500).json({
            success: false,
            message: 'En feil oppstod. Prøv igjen senere.'
        });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve the coming soon page for all routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'coming-soon.html'));
});

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

app.listen(PORT, () => {
    console.log(`🚀 Coming Soon server running on port ${PORT}`);
    console.log(`📧 Email collection endpoint: /api/subscribe`);
    console.log(`🌐 Visit: http://localhost:${PORT}`);
});
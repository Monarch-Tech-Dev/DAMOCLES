use actix_web::{web, App, HttpServer, Result, middleware::Logger};
use tracing::{info, error};
use std::env;
use dotenv::dotenv;

mod models;
mod handlers;
mod services;
mod database;
mod blockchain;
mod ai;

use database::Database;
use services::settlement_engine::SettlementEngine;
use services::ai_client::AiClient;
use blockchain::cardano_client::CardanoClient;

#[actix_web::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    dotenv().ok();
    
    tracing_subscriber::init();
    
    let database_url = env::var("DATABASE_URL")
        .expect("DATABASE_URL must be set");
    
    let cardano_node_url = env::var("CARDANO_NODE_URL")
        .expect("CARDANO_NODE_URL must be set");
    
    let port = env::var("SETTLEMENT_SERVICE_PORT")
        .unwrap_or_else(|_| "8003".to_string())
        .parse::<u16>()
        .expect("Invalid port number");
    
    // Initialize services
    let db = Database::connect(&database_url).await?;
    let ai_client = AiClient::new();
    let blockchain_client = CardanoClient::new(&cardano_node_url);
    
    let settlement_engine = SettlementEngine::new(
        db.clone(),
        ai_client,
        blockchain_client,
    );
    
    info!("Starting Settlement Service on port {}", port);
    
    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(settlement_engine.clone()))
            .wrap(Logger::default())
            .service(
                web::scope("/api/v1")
                    .service(handlers::health::health_check)
                    .service(
                        web::scope("/settlements")
                            .service(handlers::settlements::create_settlement_proposal)
                            .service(handlers::settlements::get_settlement)
                            .service(handlers::settlements::accept_settlement)
                            .service(handlers::settlements::execute_settlement)
                            .service(handlers::settlements::auto_negotiate)
                    )
                    .service(
                        web::scope("/leverage")
                            .service(handlers::leverage::calculate_leverage_score)
                            .service(handlers::leverage::get_creditor_leverage)
                    )
            )
    })
    .bind(("0.0.0.0", port))?
    .run()
    .await?;
    
    Ok(())
}
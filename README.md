# Game Database API

A Node.js/Express backend application for managing a game database with support for iOS and Android games. This application provides a RESTful API to create, read, update, delete, and search games, as well as populate the database with top 100 games from App Store and Google Play Store.

### FEATURE A: Search Functionality
- **Search by name**: Partial match search on game names
- **Search by platform**: Filter games by platform (iOS or Android)
- **Combined search**: Search by both name and platform simultaneously
- **No parameters**: Returns all games if no search parameters are provided

### FEATURE B: Populate Database with Top 100 Games
- **One-click population**: Populate database with top 100 games from both iOS App Store and Google Play Store
- **Automatic data fetching**: Fetches data from S3-hosted JSON files
- **Data transformation**: Maps and transforms raw store data to match database schema
- **Rank-based selection**: Selects top 100 games per platform based on rank field
- **Transaction safety**: Uses database transactions to ensure atomicity





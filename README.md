# Mynd : Backend Application

Backend server application for mynd health app.

### Project Structure:

`index.js`: The file that starts the Node.js server and connects it to the appropriate port.

`app.js`: The main entry point of this application where we set up Express application, configure middleware, and define routes.

`config`: Contains configuration files for the application, such as database configuration, environment variables configuration, and other settings.

`controllers`: Contains controller files that handle the business logic of the application. These files are responsible for processing requests from the routes and sending appropriate responses.

`models`: Contains model files that define the data structure and operations for the application's data models, such as database models or data schema.

`routes`: Contains route files that define the endpoints of the application and map them to the corresponding controller methods.

`services`: Contains service files that encapsulate complex business logic or third-party integrations. These files are called by controllers to perform specific tasks.

`utils`: Contains utility files that provide helper functions or utilities that are used across the application, such as error handling functions, utility functions, or validation functions.

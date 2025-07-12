# **Expense Tracker Application**    
### ( NOTE : This site will be decommissioned as backend AWS services are removed )
This repository contains the complete codebase for a personal Expense Tracker application, designed to help users manage their finances, track expenditures, set spending limits, and gain insights into their financial habits.

## 🚀 How the App Works
The Expense Tracker provides a comprehensive set of features to empower users in their financial management journey:

User Authentication: Secure registration and login functionalities powered by AWS Cognito, ensuring that each user's financial data is private and protected.

Expense Management:

Add Expenses: Easily record new expenditures with details like description, amount, category (e.g., Food, Transport, Utilities, Entertainment, Shopping, Other), and date.

View & Manage: A clear overview of all recorded expenses, with options to edit or delete entries as needed.

Intelligent Spending Limits & Alerts:

Set Custom Limits: Users can define a monthly spending limit tailored to their budget.

Real-time Monitoring: The app continuously tracks current monthly spending against the set limit.

Proactive 80% Warning: When spending reaches 80% of the set limit, a dismissible warning icon appears in the header, accompanied by a toast notification. This warning can be dismissed for a set period (e.g., 24 hours) but will reappear if spending remains above the threshold after that time, or if the spending drops below 80% and then crosses it again.

Limit Exceeded Alert: If the spending surpasses 100% of the limit, a prominent, non-dismissible alert is displayed in the header, along with a toast notification.

Email Notifications: Automated email alerts are sent to the user's registered email address when the spending limit is exceeded, providing an out-of-app reminder.

Financial Analytics: A dedicated section (ready for future enhancements) to visualize spending patterns and trends, helping users understand where their money goes.

Personalized Experience:

Dashboard Greeting: A personalized greeting based on the time of day and the user's email ID.

Theme Toggle: Switch between a modern Light Mode and a comfortable Dark Mode interface, with the preference saved locally for persistence.

Profile Settings: Manage basic user profile information.

## 🛠️ Technologies Used
This application is built using a robust full-stack architecture leveraging cutting-edge web technologies and AWS cloud services.

Frontend:
React.js: A powerful JavaScript library for building dynamic and interactive user interfaces.

React Router DOM: For client-side routing, enabling seamless navigation within the single-page application.

Tailwind CSS: A utility-first CSS framework for highly customizable and responsive styling, including efficient dark mode implementation.

Lucide React / Heroicons: Icon libraries for intuitive visual elements.

React Toastify: For elegant and user-friendly toast notifications.

Backend (AWS Amplify Gen 1):
The backend is powered by AWS Amplify, providing a scalable and serverless infrastructure:

AWS Amplify: Simplifies the development, deployment, and hosting of secure and scalable full-stack applications.

AWS Cognito: Manages user authentication and authorization.

AWS AppSync (GraphQL API): A managed GraphQL service for efficient data interaction (queries, mutations) with the backend.

AWS DynamoDB: A fast and flexible NoSQL database storing all expense data and spending limits.

AWS Lambda: Serverless functions handling custom business logic, such as spending limit checks and email notifications.

AWS API Gateway: Provides RESTful endpoints for the frontend to interact with Lambda functions.

AWS Simple Email Service (SES): Used by Lambda to send email alerts to users.

## Deployment & Version Control:
GitHub: The primary platform for version control, hosting the entire monorepo codebase, and facilitating collaborative development.

AWS Amplify Console: Used for continuous deployment and hosting of the frontend application directly from the GitHub repository. It automates the build and deployment process to a global Content Delivery Network (CDN).

⚠️ Important Note: Site Decommissioning
Please be aware that this deployed application is for demonstration and portfolio purposes only. The associated AWS backend services are subject to deletion, and therefore, the live site will be decommissioned and may cease to be functional at any time.

# 🌐 Personal Blog Website

Welcome to the **Personal Blog Website** repository, a modern and feature-rich platform designed for users to share their thoughts, ideas, and stories through blog posts. This project is an excellent example of a full-stack web application, combining a powerful backend with an intuitive and user-friendly frontend. 

The platform allows users to easily create, edit, and delete posts, as well as manage their accounts securely through a robust authentication system.

## 🚀 Key Features

### 🔐 Secure Authentication and User Management

- **User Registration and Login**: Users can sign up and log in using a secure form-based authentication system.
- **Google OAuth Authentication**: Provides users the option to log in and sign up quickly using their Google account, eliminating the need for traditional sign-up processes.
- **2-Step OTP Verification**: For enhanced security, users are required to verify their identity using a one-time password (OTP) sent via email after registration.
- **Password Encryption with BCrypt**: User passwords are hashed using BCrypt, ensuring that sensitive information is stored securely and cannot be easily compromised.

### 👤 User Profile and Post Management

- **Create New Posts**: Registered users can create new blog posts, including a title, content, and an image. This feature is designed to be simple and user-friendly.
- **Edit and Delete Posts**: Users can manage their own content by editing or deleting their posts from the system.
- **View Other Users' Posts**: Users can browse posts created by others on the platform, encouraging community engagement and interaction through content sharing.
- **Profile Maintenance**: Each user has the ability to manage their own account, making changes to their profile information, and ensuring that the platform is personalized to each individual.

### 🛠️ Admin Privileges

- **Admin Controls**: The admin has enhanced controls over the system, including the ability to edit and delete any post. This helps ensure that the content remains appropriate and aligned with the platform’s guidelines.

### 📝 Blog Post Creation

- **Rich Content Creation**: Users can create blog posts with rich content using a simple and intuitive text editor, making it easy to craft well-formatted articles.
- **Image Support**: In addition to textual content, users can upload images to accompany their blog posts, enhancing the visual appeal of their content.

### 📨 Feedback System

- **User Feedback Submission**: Users can submit feedback to the admin directly through a feedback form. This helps improve the platform by allowing users to share their thoughts, suggestions, and report issues.

### 📋 Navigation and User Interface

- **Home Page**: Displays all the published posts in a chronological or featured order.
- **Contact Page**: Currently under development, this page will allow users to reach out directly to the site administrators.
- **Feedback Page**: The feedback page provides a form for users to submit their feedback and thoughts directly to the admin, improving user experience and allowing for suggestions.
- **Navbar for Easy Navigation**: A clean, responsive navigation bar helps users quickly access important sections like Home, Posts, Contact, and Feedback.

## ❗ Current Limitations

### 👎 Lack of Interaction Features

- **No Like or Comment Feature**: Users cannot interact with posts by liking or commenting on them, which limits engagement between users.

### 🚧 Contact Page Under Development

- **Work in Progress**: The Contact page is not fully implemented yet and is still under development.

### ⛔ Footer Not Functional

- **Non-Functional Footer**: The footer section currently does not provide any functionality and will need to be implemented in future updates.

### 🖥️ Desktop-Only Support

- **No Mobile Optimization**: The platform is currently optimized only for desktop users, which limits the user experience for those on mobile or tablet devices. Mobile support will be added in future updates.

## 🛠️ Technologies Used

### Frontend
- **HTML**: For structuring the website.
- **CSS**: For styling the user interface and ensuring a responsive design.
- **JavaScript**: Adds interactivity to the website for a dynamic user experience.

### Backend
- **Node.js**: Serves as the backend runtime environment, providing a fast and scalable server-side solution.
- **EJS (Embedded JavaScript)**: Used for server-side rendering of HTML templates, allowing for dynamic and reusable components.

### Database
- **PostgreSQL**: A powerful, open-source relational database used to store all user data, posts, and related information.

### Security
- **BCrypt**: For password hashing to ensure secure storage of sensitive user information.
- **Passport.js**: For managing both local authentication (username and password) and Google OAuth authentication.
- **2-Step OTP Verification**: Adds an extra layer of security for account registration and sensitive operations.

## 🔗 How to Set Up Locally

To run the project locally, follow these steps:

1. **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/personal_blog_website.git
    ```

2. **Install dependencies**:
    ```bash
    npm install
    ```

3. **Set up environment variables**:  
   Create a `.env` file in the project root directory with the following environment variables:
   - PostgreSQL connection string
   - JWT secret key
   - Google OAuth credentials (Client ID and Secret)
   - SMTP credentials for sending OTP emails

4. **Run the server**:
    ```bash
    npm start
    ```

## 🌐 Live Demo

Explore the live version of the **Personal Blog Website** and experience all the features firsthand!

👉 [Visit the Personal Blog Website](https://personal-blog-site-u46s.onrender.com/) 👈

Start creating, browsing, and interacting with blog posts, and see how secure user authentication and post management work in real time.


## 📝 Feedback and Contributions

We welcome your feedback and contributions to improve this platform. Feel free to submit issues or pull requests if you find any bugs or would like to suggest enhancements. Contributions are highly encouraged to make this a better platform for all users.

## 📄 License

This project is licensed under the MIT License. You can view the full license [here](LICENSE).

---

Thank you for visiting the **Personal Blog Website** repository! ✨ We hope you enjoy using this platform and look forward to your feedback and contributions as we continue to improve the user experience.

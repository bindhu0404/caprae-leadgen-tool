# ProspectPro — AI-Powered Lead Generation and Scoring Tool  

**Live Demo:** [https://your-vercel-link.vercel.app](https://your-vercel-link.vercel.app)  

---

**ProspectPro** is a full-stack **AI-driven lead generation and scoring platform** designed to help companies identify, manage, and prioritize high-quality leads efficiently.  

This tool aligns with **Caprae Capital’s vision of post-acquisition transformation through AI**, offering an intuitive and data-focused system for evaluating prospects based on company attributes such as revenue, employee count, and industry relevance.  

Built with a focus on **business usability, automation, and actionable insights**, ProspectPro enhances decision-making and optimizes the sales pipeline by turning raw data into meaningful lead intelligence.  

---

## Key Features  

- **CSV Upload Support** — Upload company datasets easily to analyze and manage leads in bulk.  
- **Manual Entry Mode** — Add single leads instantly with real-time scoring and data persistence.  
- **Dynamic Lead Scoring System** — Automatically assigns scores based on revenue, size, and data completeness to prioritize outreach.  
- **Data Persistence with MongoDB Atlas** — All leads are securely stored and retrieved dynamically.  
- **Real-Time Updates** — Newly uploaded or added data immediately appears in the lead table.  
- **Export & Manage** — Save leads, export lists, and clear data efficiently.  
- **Clean, Intuitive UI** — Built using React and Tailwind CSS for a professional and responsive experience.  

---

## Tech Stack  

| Layer | Technology Used |
|-------|-----------------|
| Frontend | React.js (CRA), Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| Authentication | JWT-based auth |
| Deployment | Vercel (Frontend), Render/Atlas (Backend + DB) |
| Tools | Axios, CSV Parser, Crypto-JS |

---

## Installation & Setup  

1. **Clone this repository**  
   ```bash
   git clone https://github.com/yourusername/prospectpro.git
   cd prospectpro

2. **Install dependencies**
   ```bash
   npm install


4. **Set environment variables**
   Create a .env file in the backend root and add:

   ```
    MONGO_URI=your_mongodb_atlas_url
    JWT_SECRET=your_secret


5. **Run the app locally**

    Start backend:

    ```
    node server.js
    ```

    Start frontend:

    ```
    npm start


App runs at http://localhost:3000.

## Business Impact

ProspectPro transforms how companies approach lead qualification and pipeline prioritization by integrating data scoring directly into the lead management process.
This helps sales teams focus their efforts on high-value prospects, reducing time spent on low-quality leads and improving overall conversion efficiency.

The platform demonstrates AI-readiness by enabling structured data processing and future scalability — such as integrating ML-based enrichment or predictive scoring models.

## Dataset

Included sample dataset:
/data/companies_list.csv — Demonstrates company data with key parameters (Company Name, Revenue, Employee Count, Industry, City).

## Summary

Designed to align with Caprae Capital’s focus on AI-driven post-acquisition growth.

Provides a scalable, real-world lead intelligence system ready for enterprise integration.

Demonstrates full-stack proficiency and AI readiness principles through data processing, scoring logic, and clean UX/UI execution.

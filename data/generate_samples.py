"""
Generate synthetic sample JD and candidate resumes in PDF format using ReportLab.
Covers exact matches, semantic hidden gems, keyword stuffers, partial, unrelated, and messy resumes.
"""

import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

DATA_DIR = os.path.dirname(os.path.abspath(__file__))
RESUMES_DIR = os.path.join(DATA_DIR, "resumes")

os.makedirs(RESUMES_DIR, exist_ok=True)

styles = getSampleStyleSheet()

title_style = ParagraphStyle(
    'DocTitle',
    parent=styles['Heading1'],
    fontSize=18,
    leading=22,
    textColor=colors.HexColor('#1e293b'),
    spaceAfter=10
)

header_style = ParagraphStyle(
    'SectionHeader',
    parent=styles['Heading2'],
    fontSize=13,
    leading=17,
    textColor=colors.HexColor('#2563eb'),
    spaceBefore=8,
    spaceAfter=4
)

body_style = ParagraphStyle(
    'BodyTextCustom',
    parent=styles['Normal'],
    fontSize=10,
    leading=14,
    textColor=colors.HexColor('#334155'),
    spaceAfter=5
)

bullet_style = ParagraphStyle(
    'BulletText',
    parent=styles['Normal'],
    fontSize=10,
    leading=14,
    textColor=colors.HexColor('#334155'),
    leftIndent=15,
    spaceAfter=4
)

messy_style = ParagraphStyle(
    'MessyText',
    parent=styles['Normal'],
    fontSize=9,
    leading=12,
    textColor=colors.HexColor('#475569'),
    spaceAfter=2
)

def build_pdf(filename: str, elements: list):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )
    doc.build(elements)

def generate_sample_jd():
    path = os.path.join(DATA_DIR, "sample_jd.pdf")
    elements = [
        Paragraph("Nexora Tech Inc. — Senior Backend & AI Engineer", title_style),
        Paragraph("Location: Remote / Hybrid | Department: Engineering | Type: Full-time", body_style),
        Spacer(1, 10),
        Paragraph("Role Overview", header_style),
        Paragraph(
            "We are seeking a seasoned Senior Backend & AI Engineer to build scalable microservices and "
            "integrate generative AI and machine learning workflows into our high-performance cloud platform.",
            body_style
        ),
        Spacer(1, 8),
        Paragraph("Minimum Requirements (Must Have)", header_style),
        Paragraph("• 4+ years of professional backend development with Python.", bullet_style),
        Paragraph("• Production expertise building asynchronous microservices with FastAPI.", bullet_style),
        Paragraph("• Strong experience designing relational database schemas and complex queries in SQL / PostgreSQL.", bullet_style),
        Paragraph("• Deep understanding of REST APIs architecture, OpenAPI standards, and high-concurrency design.", bullet_style),
        Paragraph("• Hands-on production experience containerizing and deploying services with Docker.", bullet_style),
        Paragraph("• Practical experience with Machine Learning / PyTorch for model inference and evaluation.", bullet_style),
        Spacer(1, 8),
        Paragraph("Preferred Qualifications (Nice to Have)", header_style),
        Paragraph("• Experience with Kubernetes orchestration and cloud deployment on AWS.", bullet_style),
        Paragraph("• Exposure to Redis caching, message queues, and CI/CD pipelines.", bullet_style),
        Paragraph("• Familiarity with modern frontend integration (React or TypeScript).", bullet_style),
    ]
    build_pdf(path, elements)
    print(f"Generated JD: {path}")

def generate_candidate_resumes():
    candidates = [
        # Candidate 1: Aarav Sharma — Exact Match
        {
            "filename": "Aarav_Sharma_Resume.pdf",
            "content": [
                Paragraph("Aarav Sharma", title_style),
                Paragraph("Email: aarav.sharma@example.com | Phone: +1 555-0101 | GitHub: github.com/aaravsharma", body_style),
                Paragraph("Senior Backend & AI Engineer with 5+ years building distributed Python services and ML systems.", body_style),
                Spacer(1, 8),
                Paragraph("TECHNICAL SKILLS", header_style),
                Paragraph("• Languages & Frameworks: Python, FastAPI, PyTorch, SQL, PostgreSQL, REST APIs, Docker, AWS.", bullet_style),
                Spacer(1, 8),
                Paragraph("WORK EXPERIENCE", header_style),
                Paragraph("Staff Backend Engineer — CloudScale Systems (2022 – Present)", header_style),
                Paragraph("• Built high-throughput Python applications using FastAPI and SQL databases, handling 50k requests per second.", bullet_style),
                Paragraph("• Designed PostgreSQL database architecture, partition schemas, and optimized critical SQL analytical queries.", bullet_style),
                Paragraph("• Developed resilient REST APIs following OpenAPI standards with JWT authentication and rate limiting.", bullet_style),
                Paragraph("• Containerized microservices with Docker and orchestrated deployment via AWS ECS.", bullet_style),
                Paragraph("• Integrated PyTorch machine learning models for real-time natural language classification with sub-20ms latency.", bullet_style),
                Spacer(1, 8),
                Paragraph("PROJECTS & EDUCATION", header_style),
                Paragraph("• Distributed ML Pipeline: Open-source PyTorch and Docker automation tool for model evaluation.", bullet_style),
                Paragraph("• B.S. in Computer Science, State University, 2019.", body_style)
            ]
        },
        # Candidate 2: Priya Nair — Strong Semantic / Hidden Gem
        {
            "filename": "Priya_Nair_Resume.pdf",
            "content": [
                Paragraph("Priya Nair", title_style),
                Paragraph("Email: priya.nair@example.com | Portfolio: priyanair.dev | Location: San Francisco, CA", body_style),
                Paragraph("Lead Backend & Distributed Systems Architect with extensive experience in microservices and neural networks.", body_style),
                Spacer(1, 8),
                Paragraph("CORE COMPETENCIES", header_style),
                Paragraph("• Distributed Systems, Microservices Architecture, Relational Databases, Deep Learning, API Design.", bullet_style),
                Spacer(1, 8),
                Paragraph("PROFESSIONAL EXPERIENCE", header_style),
                Paragraph("Senior Software Engineer — DataFlow Labs (2021 – Present)", header_style),
                Paragraph("• Engineered backend web services and API endpoints utilizing Express.js and Node.js frameworks for event streaming.", bullet_style),
                Paragraph("• Architected relational database schemas and indexed relational storage tables for transactional consistency.", bullet_style),
                Paragraph("• Implemented deep learning neural networks with TensorFlow and Keras for automated pattern recognition.", bullet_style),
                Paragraph("• Spearheaded containerization workflows and image packaging using container engines for cloud infrastructure.", bullet_style),
                Paragraph("• Designed resilient HTTP backend interfaces connecting multiple distributed microservice clusters.", bullet_style),
                Spacer(1, 8),
                Paragraph("EDUCATION", header_style),
                Paragraph("• M.S. in Software Systems, Institute of Technology, 2020.", body_style)
            ]
        },
        # Candidate 3: Vikram Mehta — Keyword Stuffer
        {
            "filename": "Vikram_Mehta_Resume.pdf",
            "content": [
                Paragraph("Vikram Mehta", title_style),
                Paragraph("Email: vikram.mehta@example.com | Phone: +1 555-0103", body_style),
                Spacer(1, 8),
                Paragraph("KEYWORD SKILLS SUMMARY", header_style),
                Paragraph("Python, FastAPI, SQL, PostgreSQL, REST APIs, Docker, PyTorch, Python, FastAPI, SQL, Docker, Python.", body_style),
                Paragraph("FastAPI, PyTorch, Docker, PostgreSQL, REST APIs, Python developer with knowledge of Python, Docker, SQL.", body_style),
                Spacer(1, 8),
                Paragraph("EXPERIENCE", header_style),
                Paragraph("Junior Associate — Tech Solutions (2023 – 2024)", header_style),
                Paragraph("• Read about Python and FastAPI in team documentation meetings.", bullet_style),
                Paragraph("• Assisted senior developers by typing SQL commands into internal bug tracking spreadsheets.", bullet_style),
                Paragraph("• Installed Docker on local developer desktop and read tutorial on REST APIs.", bullet_style),
                Paragraph("• Attended webinar covering PyTorch deep learning basics.", bullet_style),
                Spacer(1, 8),
                Paragraph("EDUCATION", header_style),
                Paragraph("• B.A. in Information Systems, 2023.", body_style)
            ]
        },
        # Candidate 4: Rohan Gupta — Partial Candidate
        {
            "filename": "Rohan_Gupta_Resume.pdf",
            "content": [
                Paragraph("Rohan Gupta", title_style),
                Paragraph("Email: rohan.gupta@example.com | Location: Austin, TX", body_style),
                Paragraph("Backend Python Developer specializing in database queries and data processing pipelines.", body_style),
                Spacer(1, 8),
                Paragraph("TECHNICAL EXPERTISE", header_style),
                Paragraph("• Python, Django, SQL, PostgreSQL, REST APIs, Git, Linux.", bullet_style),
                Spacer(1, 8),
                Paragraph("EXPERIENCE", header_style),
                Paragraph("Python Backend Developer — FinTech Corp (2021 – Present)", header_style),
                Paragraph("• Developed core Python financial backend services using Django ORM and standard REST APIs.", bullet_style),
                Paragraph("• Executed complex SQL queries and relational migrations in PostgreSQL databases.", bullet_style),
                Paragraph("• Designed RESTful endpoints for third-party payment integration.", bullet_style),
                Paragraph("• Note: Did not use Docker or Machine Learning frameworks in this position.", bullet_style),
                Spacer(1, 8),
                Paragraph("EDUCATION", header_style),
                Paragraph("• B.S. in Computer Science, 2020.", body_style)
            ]
        },
        # Candidate 5: Sneha Patil — Frontend Specialist
        {
            "filename": "Sneha_Patil_Resume.pdf",
            "content": [
                Paragraph("Sneha Patil", title_style),
                Paragraph("Email: sneha.patil@example.com | Portfolio: snehapatil.design", body_style),
                Paragraph("Lead UI/UX Frontend Engineer passionate about React, Next.js, and CSS animations.", body_style),
                Spacer(1, 8),
                Paragraph("TECHNICAL SKILLS", header_style),
                Paragraph("• React, TypeScript, Next.js, Tailwind CSS, HTML5, Redux, Figma, UI Design.", bullet_style),
                Spacer(1, 8),
                Paragraph("EXPERIENCE", header_style),
                Paragraph("Senior Frontend Engineer — PixelCraft Studios (2021 – Present)", header_style),
                Paragraph("• Designed and built responsive web applications using React and TypeScript.", bullet_style),
                Paragraph("• Integrated backend REST APIs created by the platform engineering team.", bullet_style),
                Paragraph("• Crafted custom design systems, atomic UI components, and accessible interfaces.", bullet_style),
                Paragraph("• Wrote small Python scripts occasionally for SVG icon batch conversion.", bullet_style),
                Spacer(1, 8),
                Paragraph("EDUCATION", header_style),
                Paragraph("• B.Des in Interaction Design, 2020.", body_style)
            ]
        },
        # Candidate 6: David Miller — Unrelated
        {
            "filename": "David_Miller_Resume.pdf",
            "content": [
                Paragraph("David Miller", title_style),
                Paragraph("Email: david.miller@example.com | Phone: +1 555-0106", body_style),
                Paragraph("Senior Enterprise Account Executive & B2B Sales Director with 8+ years exceeding sales quotas.", body_style),
                Spacer(1, 8),
                Paragraph("CORE SKILLS", header_style),
                Paragraph("• Enterprise Sales, SaaS Contracting, CRM (Salesforce), Client Negotiations, Pipeline Management.", bullet_style),
                Spacer(1, 8),
                Paragraph("EXPERIENCE", header_style),
                Paragraph("Sales Director — Apex Cloud Sales (2019 – Present)", header_style),
                Paragraph("• Generated $4.2M in annual recurring revenue across Fortune 500 SaaS client engagements.", bullet_style),
                Paragraph("• Managed a team of 12 sales representatives and conducted quarterly performance evaluations.", bullet_style),
                Paragraph("• Negotiated multi-year commercial software license agreements.", bullet_style),
                Spacer(1, 8),
                Paragraph("EDUCATION", header_style),
                Paragraph("• B.A. in Business Administration, 2016.", body_style)
            ]
        },
        # Candidate 7: Ananya Sen — Messy Formatting but Strong
        {
            "filename": "Ananya_Sen_Resume.pdf",
            "content": [
                Paragraph("ANANYA SEN    --   SOFTWARE DEV", ParagraphStyle('MessyTitle', parent=styles['Heading2'], fontSize=15, textColor=colors.black)),
                Paragraph("phone: 555-0107 **** email: ananya.sen@devmail.org", messy_style),
                Spacer(1, 4),
                Paragraph("=== PROFILE SUMMARY ===", messy_style),
                Paragraph("Backend programmer with strong Python FastAPI & Postgres SQL skills for 4 years.", messy_style),
                Spacer(1, 4),
                Paragraph("--- EXPERIENCE RECORD ---", messy_style),
                Paragraph("* Python engineering: Built FastAPI microservices serving REST APIs to clients.", messy_style),
                Paragraph("* Postgres SQL: Managed relational schemas, wrote stored procedures and complex SQL joins.", messy_style),
                Paragraph("* Docker setup: Containerized services using dockerfile, managed multi-container apps.", messy_style),
                Paragraph("* PyTorch ML: Trained deep learning convolutional models for document image categorization.", messy_style),
                Spacer(1, 4),
                Paragraph("QUALIFICATIONS", messy_style),
                Paragraph("B.Tech Computer Science 2021", messy_style)
            ]
        },
        # Candidate 8: Marcus Vance — Mixed Candidate
        {
            "filename": "Marcus_Vance_Resume.pdf",
            "content": [
                Paragraph("Marcus Vance", title_style),
                Paragraph("Email: marcus.vance@example.com | Location: Seattle, WA", body_style),
                Paragraph("DevOps & Cloud Infrastructure Engineer with hands-on containerization and backend experience.", body_style),
                Spacer(1, 8),
                Paragraph("SKILLS", header_style),
                Paragraph("• Docker, Kubernetes, AWS, Terraform, CI/CD, Python, Golang, SQL, REST APIs.", bullet_style),
                Spacer(1, 8),
                Paragraph("EXPERIENCE", header_style),
                Paragraph("DevOps Engineer — CloudOps Inc (2020 – Present)", header_style),
                Paragraph("• Administered production Docker containers and orchestrated microservices across Kubernetes clusters.", bullet_style),
                Paragraph("• Wrote automation tooling and cloud lambdas in Python and Go.", bullet_style),
                Paragraph("• Designed automated CI/CD pipelines deploying containerized REST APIs onto AWS infrastructure.", bullet_style),
                Paragraph("• Maintained SQL database clusters with automated snapshotting and failover recovery.", bullet_style),
                Spacer(1, 8),
                Paragraph("EDUCATION", header_style),
                Paragraph("• B.S. in Computer Systems, 2019.", body_style)
            ]
        }
    ]

    for cand in candidates:
        filepath = os.path.join(RESUMES_DIR, cand["filename"])
        build_pdf(filepath, cand["content"])
        print(f"Generated resume: {filepath}")

if __name__ == "__main__":
    generate_sample_jd()
    generate_candidate_resumes()
    print("All synthetic test PDFs generated successfully!")

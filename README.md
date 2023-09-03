# Photo-App
Cloud-native photo app that interacts with AWS S3 and RDS to display data and allows users to upload and download photos

## Project Details
- Context: Class project for CS-310: Scalable Software Architectures [(syllabus)](https://www.dropbox.com/s/ltwtt7p91qutv5t/cs310-Syllabus.pdf?dl=0) with Prof. Joe Hummel at Northwestern University's McCormick School of Engineering.
- Learning Goal: Build a mutli-tier web service using AWS EC2, RDS, and S3; introduction to asynchronous programming and HTTP protocol. 

## Software Architecture
- Web server: Node.js and Express framework
- Object storage: AWS S3 (Simple Storage Service)
- Data storage: AWS RDS (Relational Database Service)
- Hosting: AWS EC2 (Elastic Compute) Elastic Beanstalk

Features 
Server: 
- Download and open files from AWS S3
- Upload files to S3 and write user and photo information to RDS
- Query RDS for information such as: # and names of files in S3 bucket, # and names of users/assets
Client:
- Python client that prompts user to take any of the above actions

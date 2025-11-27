import React from 'react';
import '../assets/Team.css';

const teamMembers = [
  { 
    name: 'Adithi J Rao',
      role: 'ML Engineer', 
    responsibility: 'Model training, evaluation, and integration into the extension', 
    
    img: 'https://placehold.co/200x200/e0f2fe/0f172a?text=AJ', 
    linkedin: '#', 
    github: '#'
  },
  { 
    name: 'Ananya K Naik', 
  role: 'Frontend Developer', 
    responsibility: 'UI/UX Design and React Implementation',
    img: 'https://placehold.co/200x200/e0f2fe/0f172a?text=AN', 
    linkedin: '#', 
    github: '#'
  },
  { 
    name: 'B Vighnesh Kumar', 
    role: 'Backend Developer', 
    responsibility: 'Spring Boot APIs, database design, and integration',
    img: 'https://placehold.co/200x200/e0f2fe/0f172a?text=VK', 
    linkedin: '#', 
    github: '#'
  },
  { 
    name: 'Chinchana Laxmi P', 
    role: 'Research & Documentation', 
    responsibility: 'Requirement analysis, report writing, and project presentation',
    img: 'https://placehold.co/200x200/e0f2fe/0f172a?text=CL', 
    linkedin: '#', 
    github: '#'
  },
  {
    name: 'Annapurna M',
  role: 'Project Guide',
  responsibility: 'Providing guidance and valuable suggestions to help shape the project from concept to completion.',
  img: 'https://placehold.co/200x200/e0f2fe/0f172a?text=AM'
  }
];

const Team = () => {
  return (
    <section id="team" className="section team">
      <div className="container">
        <h2 className="section-title">Meet the Innovators</h2>
        <p className="section-subtitle">
          The passionate team behind the Dark Pattern Detector project — blending
          skills in Machine Learning, Web Development, and Research to fight deceptive design.
        </p>

        <div className="team__grid">
          {teamMembers.map((member, index) => (
            <div className="team-member" key={index}>
              <img
                src={member.img || "https://placehold.co/200x200?text=Photo"}
                alt={member.name}
                className="team-member__photo"
              />
              <h3>{member.name}</h3>
              <p className="team-role">{member.role}</p>
              <p className="team-responsibility">{member.responsibility}</p>
              <div className="team-links">
                {member.linkedin && (
                  <a href={member.linkedin} target="_blank" rel="noreferrer">
                    <i className="fab fa-linkedin"></i>
                  </a>
                )}
                {member.github && (
                  <a href={member.github} target="_blank" rel="noreferrer">
                    <i className="fab fa-github"></i>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Team;

const Experience = ({ experience, projects, education, certificates }) => {
  return (
    <>

      <section className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">项目经验</h2>
        <div className="space-y-6">
          {projects.map((project) => (
            <div key={project.name} className="border-l-4 border-primary pl-4">
              <h3 className="text-xl font-semibold">{project.name}</h3>
              <p className="text-gray-600">{project.period}</p>
              <p className="mt-2 text-gray-700">{project.description}</p>
              <ul className="mt-2 list-disc list-inside space-y-1">
                {project.responsibilities.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">工作经历</h2>
        <div className="space-y-6">
          {experience.map((exp) => (
            <div key={exp.company} className="border-l-4 border-primary pl-4">
              <h3 className="text-xl font-semibold">{exp.company}</h3>
              <p className="text-gray-600">
                {exp.position} | {exp.period}
              </p>
              <ul className="mt-2 list-disc list-inside space-y-1">
                {exp.achievements.map((item, index) => (
                  <li key={index} className="text-gray-700">{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">教育背景</h2>
        {education.map((edu) => (
          <div key={edu.school}>
            <h3 className="text-xl font-semibold">{edu.school}</h3>
            <p className="text-gray-600">{edu.degree} | {edu.period}</p>
            <ul className="mt-2 list-disc list-inside space-y-1">
              {edu.achievements.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">证书</h2>
        <div className="space-y-4">
          {certificates.map((cert) => (
            <div key={cert.name}>
              <h3 className="text-lg font-semibold">{cert.name}</h3>
              <p className="text-gray-600">{cert.date}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

export default Experience 
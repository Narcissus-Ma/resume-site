import { useState } from 'react'
import Header from './components/Header'
import About from './components/About'
import Skills from './components/Skills'
import Experience from './components/Experience'
import PDFModal from './components/PDFModal'
import { resumeData } from './data/resumeData'

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [userInfo, setUserInfo] = useState({
    name: '',
    phone: '',
    email: ''
  })

  return (
    <div className="min-h-screen bg-gray-100">
      <Header onExportClick={() => setIsModalOpen(true)} />
      <main className="container mx-auto px-4 py-8">
        <About userInfo={userInfo} />
        <Skills skills={resumeData.basicInfo.skills} />
        <Experience 
          experience={resumeData.experience}
          projects={resumeData.projects}
          education={resumeData.education}
          certificates={resumeData.certificates}
        />
      </main>
      <PDFModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSubmit={(data) => setUserInfo(data)}
      />
    </div>
  )
}

export default App 
import { useState } from 'react'
import Modal from 'react-modal'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { resumeData } from '../data/resumeData'

Modal.setAppElement('#root')

const PDFModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: ''
  })
  const [isGenerating, setIsGenerating] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleDownloadPDF = async () => {
    try {
      setIsGenerating(true)
      
      // 创建临时的简历 DOM
      const resumeDiv = document.createElement('div')
      resumeDiv.className = 'bg-white p-8'
      resumeDiv.style.width = '794px' // A4 宽度
      resumeDiv.innerHTML = `
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold mb-2">${formData.name}</h1>
          <p class="text-gray-600">${resumeData.basicInfo.title}</p>
          <div class="mt-4 space-x-4">
            <span>电话: ${formData.phone}</span>
            <span>邮箱: ${formData.email}</span>
          </div>
        </div>

        <section class="mb-8">
          <h2 class="text-2xl font-bold mb-4 border-b pb-2">技能专长</h2>
          <div class="grid grid-cols-2 gap-4">
            ${resumeData.basicInfo.skills.map(skill => `
              <div>
                <h3 class="font-semibold">${skill.category}</h3>
                <ul class="list-disc list-inside">
                  ${skill.items.map(item => `<li>${item}</li>`).join('')}
                </ul>
              </div>
            `).join('')}
          </div>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-bold mb-4 border-b pb-2">工作经历</h2>
          <div class="space-y-6">
            ${resumeData.experience.map(exp => `
              <div>
                <h3 class="text-xl font-semibold">${exp.company}</h3>
                <p class="text-gray-600">${exp.position} | ${exp.period}</p>
                <ul class="list-disc list-inside mt-2">
                  ${exp.achievements.map(item => `<li>${item}</li>`).join('')}
                </ul>
              </div>
            `).join('')}
          </div>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-bold mb-4 border-b pb-2">项目经验</h2>
          <div class="space-y-6">
            ${resumeData.projects.map(project => `
              <div>
                <h3 class="text-xl font-semibold">${project.name}</h3>
                <p class="text-gray-600">${project.period}</p>
                <p class="mt-2">${project.description}</p>
                <ul class="list-disc list-inside mt-2">
                  ${project.responsibilities.map(item => `<li>${item}</li>`).join('')}
                </ul>
              </div>
            `).join('')}
          </div>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-bold mb-4 border-b pb-2">教育背景</h2>
          ${resumeData.education.map(edu => `
            <div>
              <h3 class="text-xl font-semibold">${edu.school}</h3>
              <p class="text-gray-600">${edu.degree} | ${edu.period}</p>
              <ul class="list-disc list-inside mt-2">
                ${edu.achievements.map(item => `<li>${item}</li>`).join('')}
              </ul>
            </div>
          `).join('')}
        </section>

        <section>
          <h2 class="text-2xl font-bold mb-4 border-b pb-2">证书</h2>
          <div class="space-y-2">
            ${resumeData.certificates.map(cert => `
              <div>
                <h3 class="text-lg font-semibold">${cert.name}</h3>
                <p class="text-gray-600">${cert.date}</p>
              </div>
            `).join('')}
          </div>
        </section>
      `
      
      // 将临时 DOM 添加到页面
      document.body.appendChild(resumeDiv)
      
      // 使用 html2canvas 将 DOM 转换为图片
      const canvas = await html2canvas(resumeDiv, {
        scale: 2,
        useCORS: true,
        logging: false,
        windowHeight: resumeDiv.scrollHeight
      })
      
      // 移除临时 DOM
      document.body.removeChild(resumeDiv)
      
      // 创建 PDF
      const pdf = new jsPDF('p', 'mm', 'a4')
      const imgData = canvas.toDataURL('image/png')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = pageWidth
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      
      // 分页处理
      let heightLeft = imgHeight
      let position = 0
      let page = 1

      // 添加第一页
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      // 添加后续页面
      while (heightLeft >= 0) {
        position = -pageHeight * page
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
        page++
      }
      
      // 保存 PDF
      pdf.save(`${formData.name}的简历.pdf`)
      onSubmit?.(formData)
      onClose()
    } catch (error) {
      console.error('PDF生成失败:', error)
      alert('PDF生成失败，请重试')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="modal-content"
      overlayClassName="modal-overlay"
    >
      <div className="bg-white p-6 rounded-lg max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-4">导出简历</h2>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">姓名</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">手机号</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">邮箱</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              required
            />
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={!formData.name || !formData.phone || !formData.email || isGenerating}
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark disabled:opacity-50"
            >
              {isGenerating ? '生成中...' : '下载PDF'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}

export default PDFModal 
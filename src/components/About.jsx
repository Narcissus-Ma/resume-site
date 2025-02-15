import { resumeData } from '../data/resumeData'

const About = ({ userInfo }) => {
  return (
    <section className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">{userInfo.name || '马先生'}</h1>
        <p className="text-gray-600">{resumeData.basicInfo.title}</p>
        <div className="mt-4 space-x-4">
          <span>电话: {userInfo.phone || 'XXX-XXXX-XXXX'}</span>
          <span>邮箱: {userInfo.email || 'xxx@example.com'}</span>
        </div>
      </div>
    </section>
  )
}

export default About 
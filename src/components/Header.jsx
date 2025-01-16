const Header = ({ onExportClick }) => {
  return (
    <header className="bg-primary text-white shadow-lg">
      <div className="container mx-auto px-4 py-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">我的简历</h1>
        <button
          onClick={onExportClick}
          className="px-4 py-2 bg-white text-primary rounded-md hover:bg-gray-100"
        >
          导出PDF
        </button>
      </div>
    </header>
  )
}

export default Header 
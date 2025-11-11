interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) => {
  const getVisiblePages = () => {
    const maxVisible = 5
    let startPage = 1
    let endPage = totalPages

    if (totalPages <= maxVisible) {
      // 전체 페이지가 5개 이하면 모두 표시
      startPage = 1
      endPage = totalPages
    } else {
      if (currentPage <= 5) {
        // 1-5페이지: 1, 2, 3, 4, 5 표시
        startPage = 1
        endPage = 5
      } else {
        // 6페이지 이상: 현재 페이지가 속한 그룹의 시작부터 마지막까지
        const groupStart = Math.floor((currentPage - 1) / 5) * 5 + 1
        const groupEnd = Math.min(groupStart + 4, totalPages)

        startPage = groupStart
        endPage = groupEnd
      }
    }

    const pages = []
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    return pages
  }

  const visiblePages = getVisiblePages()

  return (
    <div className="flex items-center justify-center space-x-2 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        &lt;
      </button>

      {visiblePages.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-2 text-sm font-medium rounded-lg ${
            page === currentPage
              ? 'bg-gray-800 text-white'
              : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        &gt;
      </button>
    </div>
  )
}

export default Pagination

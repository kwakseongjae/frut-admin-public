import { useNavigate } from 'react-router-dom'
import { type SellerApplication } from '@/constants/dummy'

interface SellerApplicationListProps {
  applications: SellerApplication[]
}

const SellerApplicationList = ({
  applications,
}: SellerApplicationListProps) => {
  const navigate = useNavigate()

  const handleRowClick = (applicationId: number) => {
    navigate(`/seller-application/${applicationId}`)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full table-fixed divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-16 px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                번호
              </th>
              <th className="w-32 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                농장명
              </th>
              <th className="w-32 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                판매자명
              </th>
              <th className="w-32 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                등록 요청일
              </th>
              <th className="w-24 px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                승인 여부
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {applications.map((application, index) => {
              // 승인 여부 태그 스타일 결정
              const getStatusStyle = () => {
                const status = (application as any).status || 'PENDING'
                
                if (status === 'APPROVED') {
                  return 'bg-green-100 text-green-800'
                } else if (status === 'REJECTED') {
                  return 'bg-red-100 text-red-800'
                } else {
                  return 'bg-gray-100 text-gray-800'
                }
              }

              const statusDisplay = (application as any).statusDisplay || '검토 중'

              return (
                <tr
                  key={application.id}
                  onClick={() => handleRowClick(application.id)}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center ${
                    index === 0 ? 'rounded-tl-lg' : ''
                  } ${index === applications.length - 1 ? 'rounded-bl-lg' : ''}`}>
                    {application.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {application.farmName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {application.nickname || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {application.requestDate}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-center ${
                    index === 0 ? 'rounded-tr-lg' : ''
                  } ${index === applications.length - 1 ? 'rounded-br-lg' : ''}`}>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyle()}`}
                    >
                      {statusDisplay}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default SellerApplicationList

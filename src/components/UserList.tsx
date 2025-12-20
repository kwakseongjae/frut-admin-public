import type { User } from '@/lib/api/user'

interface UserListProps {
  users: User[]
  onSort: (column: string) => void
}

const UserList = ({ users, onSort }: UserListProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full table-fixed divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-16 px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                번호
              </th>
              <th className="w-24 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                <button
                  onClick={() => onSort('name')}
                  className="flex items-center space-x-1 hover:text-gray-700"
                >
                  <span>이름</span>
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </th>
              <th className="w-32 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                아이디
              </th>
              <th className="w-20 px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                판매자 여부
              </th>
              <th className="w-32 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                닉네임
              </th>
              <th className="w-24 px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                <button
                  onClick={() => onSort('purchase_count')}
                  className="flex items-center justify-center space-x-1 hover:text-gray-700 mx-auto"
                >
                  <span>구매 횟수</span>
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </th>
              <th className="w-24 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                <button
                  onClick={() => onSort('date_joined')}
                  className="flex items-center space-x-1 hover:text-gray-700"
                >
                  <span>가입일</span>
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </th>
              <th className="w-20 px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                상태
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user, index) => (
              <tr
                key={user.id}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() =>
                  (window.location.href = `/user-detail/${user.id}`)
                }
              >
                <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center ${
                  index === 0 ? 'rounded-tl-lg' : ''
                } ${index === users.length - 1 ? 'rounded-bl-lg' : ''}`}>
                  {user.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className="truncate max-w-[120px]" title={user.username}>
                    {user.username}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                  {user.is_seller ? 'O' : 'X'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div
                    className="truncate max-w-[120px]"
                    title={user.nickname || '-'}
                  >
                    {user.nickname || '-'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                  {user.purchase_count}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.date_joined}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-center ${
                  index === 0 ? 'rounded-tr-lg' : ''
                } ${index === users.length - 1 ? 'rounded-br-lg' : ''}`}>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.status === 'WITHDRAWN'
                        ? 'bg-red-100 text-red-800'
                        : user.status === 'BLOCKED'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {user.status === 'ACTIVE' ? '회원' : user.status_display}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default UserList

const AdminDataTable = ({ children }) => {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm scrollbar-thin scrollbar-thumb-slate-200">
      <div className="min-w-[900px] w-full">
        {children}
      </div>
    </div>
  )
}

export default AdminDataTable
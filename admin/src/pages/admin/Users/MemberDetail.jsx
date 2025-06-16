import ManagementDetail from "../../../components/ManagementDetail";

const MemberDetail = () => {
  return (
    <ManagementDetail
      title="Thông Tin Nhân Viên"
      fetchUrl="http://localhost:8001/api/company/viewMember"
    />
  );
};

export default MemberDetail;

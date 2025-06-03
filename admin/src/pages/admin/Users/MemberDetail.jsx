import ManagementDetail from "../../../components/ManagementDetail";

const MemberDetail = () => {
  return (
    <ManagementDetail
      title="Thông Tin Nhân Viên"
      fetchUrl="https://apitaskmanager.pdteam.net/api/company/viewMember"
    />
  );
};

export default MemberDetail;

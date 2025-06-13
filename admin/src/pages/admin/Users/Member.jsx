import React from "react";
import UserTable from "../../../components/UserTable";

const MemberPage = () => {
  return (
    <UserTable
      title="Quản Lý Nhân Viên"
      fetchUrl="http://localhost:8001/api/company/showallMember"
      deleteUrl="http://localhost:8001/api/company/deleteUser"
      originPage="member"
      createLink="/create-user"
    />
  );
};

export default MemberPage;

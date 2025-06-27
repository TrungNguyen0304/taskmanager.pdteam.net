import React from "react";
import UserTable from "../../../components/UserTable";

const MemberPage = () => {
  return (
    <UserTable
      title="Quản Lý Nhân Viên"
      fetchUrl="https://apitaskmanager.pdteam.net/api/company/showallMember"
      deleteUrl="https://apitaskmanager.pdteam.net/api/company/deleteUser"
      originPage="member"
      createLink="/create-user"
    />
  );
};

export default MemberPage;

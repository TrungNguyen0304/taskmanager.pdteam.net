import React from "react";
import UserTable from "../../../components/UserTable";

const Leader = () => {
  return (
    <UserTable
      title="Quản Lý Leader"
      fetchUrl="https://apitaskmanager.pdteam.net/api/company/showallLeaders"
      deleteUrl="https://apitaskmanager.pdteam.net/api/company/deleteUser"
      originPage="leader"
      createLink="/create-leader"
    />
  );
};

export default Leader;

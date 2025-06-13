import React from "react";
import UserTable from "../../../components/UserTable";

const Leader = () => {
  return (
    <UserTable
      title="Quản Lý Leader"
      fetchUrl="http://localhost:8001/api/company/showallLeaders"
      deleteUrl="http://localhost:8001/api/company/deleteUser"
      originPage="leader"
      createLink="/create-leader"
    />
  );
};

export default Leader;

import React from "react";
import ManagementDetail from "../../../components/ManagementDetail";

const LeaderDetail = () => {
  return (
    <ManagementDetail
      title="Thông Tin Leader"
      fetchUrl="https://apitaskmanager.pdteam.net/api/company/viewLeader"
      isLeader={true}
    />
  );
};

export default LeaderDetail;

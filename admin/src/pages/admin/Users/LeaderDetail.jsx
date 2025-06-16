import React from "react";
import ManagementDetail from "../../../components/ManagementDetail";

const LeaderDetail = () => {
  return (
    <ManagementDetail
      title="Thông Tin Leader"
      fetchUrl="http://localhost:8001/api/company/viewLeader"
      isLeader={true}
    />
  );
};

export default LeaderDetail;

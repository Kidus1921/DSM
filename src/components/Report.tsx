import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import LabReport from "./dashboard/LabReport";
import LabSummaryReport from "./dashboard/LabSummaryReport";
import LabTestReport from "./dashboard/LabTestReport"; 
import LabTestByCategory from "./dashboard/LabTestByCategory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Reports = () => {
  const [activeTab, setActiveTab] = useState("lab-report");

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 md:grid-cols-4 mb-6">
              <TabsTrigger value="lab-report">Lab Report</TabsTrigger>
              <TabsTrigger value="lab-summary">Lab Summary Report</TabsTrigger>
              <TabsTrigger value="lab-test-report">Lab Test Report</TabsTrigger> {/* new tab */}
              <TabsTrigger value="LabTestByCategory">Lab Test Report By Category</TabsTrigger> 
            </TabsList>

            <TabsContent value="lab-report">
              <LabReport />
            </TabsContent>

            <TabsContent value="lab-summary">
              <LabSummaryReport />
            </TabsContent>

            <TabsContent value="lab-test-report">
              <LabTestReport /> {/* render the new report */}
            </TabsContent>
            <TabsContent value="LabTestByCategory">
              <LabTestByCategory /> {/* render the new report */}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;

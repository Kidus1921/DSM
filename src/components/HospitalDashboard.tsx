import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Hospital, Users, TestTube, CheckCircle } from "lucide-react";
import PatientRegistration from "./dashboard/PatientRegistration";
import TestAssignment from "./dashboard/TestAssignment";
import TestDataEntry from "./dashboard/TestDataEntry";
import Confirmation from "./dashboard/Confirmation";
import LabManagement from "./dashboard/LabManagement";
import { Link } from "react-router-dom";

interface Patient {
  id: string;
  name: string;
  uniqueId: string;
  age: string;
  sex: string;
  rank: string;
  ward: string;
}

interface Test {
  id: string;
  patientId: string;
  type: string;
  status: 'pending' | 'completed';
  createdAt: string;
  lab_test_id: string;
}

const HospitalDashboard = () => {
  const [activeTab, setActiveTab] = useState("registration");
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);
  const [currentTest, setCurrentTest] = useState<Test | null>(null);
  const [completedAction, setCompletedAction] = useState<string>("");

  const handlePatientRegistered = (patient: Patient) => {
    setCurrentPatient(patient);
    setActiveTab("assignment");
  };

  const handleTestAssigned = (test: Test) => {
    setCurrentTest(test);
    setActiveTab("data-entry");
  };

  const handleTestCompleted = (action: string) => {
    setCompletedAction(action);
    setActiveTab("confirmation");
  };

  const handleNewPatient = () => {
    setCurrentPatient(null);
    setCurrentTest(null);
    setCompletedAction("");
    setActiveTab("registration");
  };

  const handleAddAnotherTest = () => {
    setCurrentTest(null);
    setCompletedAction("");
    setActiveTab("assignment");
  };

  

  return (
     <div className="min-h-screen bg-medical-light">
      {/* Header */}
      <div className="bg-white border-b border-border shadow-sm">
  <div className="container max-w-6xl mx-auto px-4 py-4">
    <div className="flex flex-col md:flex-row md:items-center gap-3">
      {/* Left Side: Icon + Title */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-medical-blue rounded-lg text-white">
          <Hospital className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Hospital Clerk Dashboard</h1>
          <p className="text-muted-foreground">Complete patient workflow management</p>
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right Side: Links */}
     <div className="flex items-center gap-4">
  <Link 
    to="/dashboard/LabManagement" 
    className="text-medical-blue font-semibold hover:underline"
  >
    Lab Management
  </Link>
  <Link 
    to="/reports" 
    className="text-medical-blue font-semibold hover:underline"
  >
    Report
  </Link>
</div>
    </div>
  </div>
</div>

      {/* Main Content */}
      <div className="container max-w-6xl mx-auto px-4 py-6">

         <div className="flex justify-end mb-4">
    {currentPatient && (
      <Badge variant="secondary" className="bg-medical-blue/10 text-medical-blue">
        Current Patient: {currentPatient.name}
      </Badge>
    )}
  </div>

        <Card>
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="registration" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Registration
                </TabsTrigger>
                <TabsTrigger value="assignment" className="flex items-center gap-2" disabled={!currentPatient}>
                  <TestTube className="h-4 w-4" />
                  Assign Test
                </TabsTrigger>
                <TabsTrigger value="data-entry" className="flex items-center gap-2" disabled={!currentTest}>
                  <TestTube className="h-4 w-4" />
                  Enter Data
                </TabsTrigger>
                <TabsTrigger value="confirmation" className="flex items-center gap-2" disabled={!completedAction}>
                  <CheckCircle className="h-4 w-4" />
                  Confirmation
                </TabsTrigger>
              </TabsList>

              <TabsContent value="registration">
                <PatientRegistration onPatientRegistered={handlePatientRegistered} />
              </TabsContent>

              <TabsContent value="assignment">
                {currentPatient && (
                  <TestAssignment 
                    patient={currentPatient} 
                    onTestAssigned={handleTestAssigned} 
                  />
                )}
              </TabsContent>

              <TabsContent value="data-entry">
                {currentTest && currentPatient && (
                  <TestDataEntry 
                    test={currentTest} 
                    patient={currentPatient}
                    onTestCompleted={handleTestCompleted} 
                  />
                )}
              </TabsContent>

              <TabsContent value="confirmation">
                <Confirmation 
                  action={completedAction}
                  patient={currentPatient}
                  onNewPatient={handleNewPatient}
                  onAddAnotherTest={handleAddAnotherTest}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HospitalDashboard;
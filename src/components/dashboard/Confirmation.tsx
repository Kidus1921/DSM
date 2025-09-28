import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, UserPlus, TestTube, FileText } from "lucide-react";

// Patient interface now matches PatientRegistration
interface Patient {
  id: string;
  name: string;
  uniqueId: string;
  age: string;
  sex: string;
  rank: string;
  ward: string;
}

interface ConfirmationProps {
  action: string;
  patient: Patient | null;
  onNewPatient: () => void;
  onAddAnotherTest: () => void;
}

const Confirmation = ({ action, patient, onNewPatient, onAddAnotherTest }: ConfirmationProps) => {
  return (
    <div className="space-y-6">
      {/* Success Message */}
      <Card className="border-medical-success/20 bg-medical-success/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-medical-success/10 rounded-full">
              <CheckCircle className="h-8 w-8 text-medical-success" />
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-medical-success mb-2">Success!</h2>
            <p className="text-lg text-foreground mb-4">{action}</p>
            {patient && (
              <div className="text-muted-foreground">
                Completed for patient: <strong>{patient.name}</strong> (ID: {patient.uniqueId})
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Next Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-medical-blue" />
            What would you like to do next?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={onNewPatient}
              variant="outline"
              className="h-24 flex-col gap-2 hover:bg-medical-blue/5 hover:border-medical-blue"
            >
              <UserPlus className="h-6 w-6 text-medical-blue" />
              <div className="text-center">
                <div className="font-medium">Register New Patient</div>
                <div className="text-sm text-muted-foreground">Start fresh workflow</div>
              </div>
            </Button>

            {patient && (
              <Button
                onClick={onAddAnotherTest}
                variant="outline"
                className="h-24 flex-col gap-2 hover:bg-medical-blue/5 hover:border-medical-blue"
              >
                <TestTube className="h-6 w-6 text-medical-blue" />
                <div className="text-center">
                  <div className="font-medium">Add Another Test</div>
                  <div className="text-sm text-muted-foreground">For {patient.name}</div>
                </div>
              </Button>
            )}
          </div>

          {patient && (
            <div className="mt-6 p-4 bg-medical-light/30 rounded-lg">
              <h4 className="font-medium mb-2">Patient Summary</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-muted-foreground">Name:</span> {patient.name}</div>
                <div><span className="text-muted-foreground">Ward:</span> {patient.ward}</div>
                <div><span className="text-muted-foreground">Rank:</span> {patient.rank}</div>
                <div><span className="text-muted-foreground">Sex:</span> {patient.sex}</div>
                <div><span className="text-muted-foreground">Age:</span> {patient.age}</div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Unique ID:</span> {patient.uniqueId}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Confirmation;
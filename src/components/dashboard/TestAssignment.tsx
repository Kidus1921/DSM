import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TestTube, User, Calendar, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

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
  lab_test_id: string;
  type: string;
  status: 'pending' | 'completed';
  createdAt: string;
}

interface LabTest {
  id: string;
  name: string;
  description: string;
}

interface TestAssignmentProps {
  patient: Patient;
  onTestAssigned: (test: Test) => void;
}

const TestAssignment = ({ patient, onTestAssigned }: TestAssignmentProps) => {
  const [selectedTestType, setSelectedTestType] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchLabTests = async () => {
      const { data, error } = await supabase.from("lab_tests").select("*");
      if (!error && data) {
        setLabTests(data);
      }
    };
    fetchLabTests();
  }, []);

  const handleAssignTest = async () => {
    if (!selectedTestType) return;

    setIsLoading(true);

    const selectedTest = labTests.find((t) => t.id === selectedTestType);
    if (!selectedTest) {
      toast({
        title: "Error",
        description: "Selected test type not found.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    const test: Test = {
      id: uuidv4(),
      patientId: patient.id,
      type: selectedTest.name,
      lab_test_id: selectedTest.id,
      status: 'pending' as 'pending', // TypeScript fix
      createdAt: new Date().toISOString(),
    };

    toast({
      title: "Test Assigned Successfully",
      description: `${selectedTest.name} assigned to ${patient.name}`,
    });

    onTestAssigned(test);
    setIsLoading(false);
  };

  const selectedTest = labTests.find((t) => t.id === selectedTestType);

  return (
    <div className="space-y-6">
      {/* Patient Info Card */}
      <Card className="bg-medical-light/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-medical-blue/10 rounded-lg">
                <User className="h-5 w-5 text-medical-blue" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{patient.name}</h3>
                <p className="text-muted-foreground">
                  Unique ID: {patient.uniqueId}
                </p>
              </div>
            </div>
            <div className="flex gap-4 text-sm text-muted-foreground flex-wrap">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Age: {patient.age}
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {patient.ward}
              </div>
              <Badge variant="secondary">{patient.rank}</Badge>
              <Badge variant="outline">{patient.sex}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Assignment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5 text-medical-blue" />
            Assign Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="testType">Select Test Type *</Label>
            <Select
              value={selectedTestType}
              onValueChange={setSelectedTestType}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a test type" />
              </SelectTrigger>
              <SelectContent>
                {labTests.map((test) => (
                  <SelectItem key={test.id} value={test.id}>
                    <div>
                      <div className="font-medium">{test.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {test.description}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedTest && (
            <div className="p-4 bg-medical-light/30 rounded-lg border">
              <h4 className="font-medium text-medical-blue mb-2">
                {selectedTest.name}
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                {selectedTest.description}
              </p>
              <div className="text-xs text-muted-foreground">
                This test will be assigned to <strong>{patient.name}</strong>{" "}
                and added to their medical record.
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button
              onClick={handleAssignTest}
              disabled={!selectedTestType || isLoading}
              className="bg-medical-blue hover:bg-medical-blue/90"
            >
              {isLoading ? "Assigning..." : "Assign Test"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestAssignment;

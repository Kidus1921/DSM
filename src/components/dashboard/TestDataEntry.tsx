import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, User, TestTube } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
  status: "pending" | "completed";
  createdAt: string;
  lab_test_id: string;
}

interface TestDataEntryProps {
  test: Test;
  patient: Patient;
  onTestCompleted: (action: string) => void;
}

interface LabTestField {
  id: string;
  lab_test_id: string;
  field_name: string;
  field_type: string;
  field_options: string[] | null;
  is_required: boolean;
  field_order: number;
}

const TestDataEntry = ({
  test,
  patient,
  onTestCompleted,
}: TestDataEntryProps) => {
  const [testData, setTestData] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [fields, setFields] = useState<LabTestField[]>([]);
  const { toast } = useToast();

  // Fetch dynamic fields for this test type from lab management
  useEffect(() => {
  const fetchFields = async () => {
    if (!test.lab_test_id) {
      console.log("No lab_test_id in test:", test);
      setFields([]);
      return;
    }
    const { data, error } = await supabase
      .from("lab_test_fields")
      .select("*")
      .eq("lab_test_id", test.lab_test_id)
      .order("field_order");

    if (error) {
      console.error("Error fetching fields:", error);
    } else {
      console.log("Fetched fields:", data);
    }

    setFields(!error ? data || [] : []);
  };
  fetchFields();
}, [test.lab_test_id]);


  const handleInputChange = (field: string, value: string) => {
    setTestData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Prepare rows for test_results insert
    const rows = Object.entries(testData)
  .filter(([_, value]) => value && value.trim() !== "")
  .map(([field_name, field_value]) => {
    const field = fields.find(f => f.field_name === field_name);
    return {
      test_id: test.id,
      field_id: field?.id,  // <-- important
      field_name,
      field_value
    };
  });


    if (rows.length === 0) {
      toast({
        title: "Error",
        description: "No data to save.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      // 1️⃣ Insert test into `tests` table first
      const { data: insertedTest, error: testError } = await supabase
        .from("tests")
        .insert({
          id: test.id,
          patient_id: test.patientId,
          lab_test_id: test.lab_test_id,
          status: test.status,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (testError) {
        toast({
          title: "Error",
          description: testError.message,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // 2️⃣ Insert test results
      const { error: resultsError } = await supabase
        .from("test_results")
        .insert(rows);

      if (resultsError) {
        toast({
          title: "Error",
          description: resultsError.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Test Results Saved",
          description: "Results have been saved successfully",
        });
        onTestCompleted("Test results saved successfully");
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Something went wrong",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  const renderDynamicFields = () => {
    if (fields.length === 0) {
      return (
        <div className="text-center text-muted-foreground py-8">
          No fields have been defined for this test in Lab Management.
          <br />
          Please configure the test fields in the Lab Management section.
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((field) => (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.field_name}>
              {field.field_name}
              {field.is_required && " *"}
            </Label>

           {(field.field_type === "number" || field.field_type === "float") && (
  <Input
    id={field.field_name}
    type="number"
    value={testData[field.field_name] || ""}
    onChange={(e) =>
      handleInputChange(field.field_name, e.target.value)
    }
    required={field.is_required}
  />
)}


            {field.field_type === "text" && (
              <Input
                id={field.field_name}
                type="text"
                value={testData[field.field_name] || ""}
                onChange={(e) =>
                  handleInputChange(field.field_name, e.target.value)
                }
                required={field.is_required}
              />
            )}

            {field.field_type === "textarea" && (
              <Textarea
                id={field.field_name}
                value={testData[field.field_name] || ""}
                onChange={(e) =>
                  handleInputChange(field.field_name, e.target.value)
                }
                rows={3}
                required={field.is_required}
              />
            )}

            {field.field_type === "dropdown" && field.field_options && (
              <Select
                value={testData[field.field_name] || ""}
                onValueChange={(value) =>
                  handleInputChange(field.field_name, value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={`Select ${field.field_name}`} />
                </SelectTrigger>
                <SelectContent>
                  {field.field_options.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        ))}
      </div>
    );
  };

  const hasData = Object.values(testData).some((value) => value.trim() !== "");

  return (
    <div className="space-y-6">
      {/* Patient Info */}
      <Card className="bg-medical-light/50">
        <CardContent className="p-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-medical-blue/10 rounded-lg">
              <User className="h-5 w-5 text-medical-blue" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{patient.name}</h3>
              <p className="text-muted-foreground">
                Unique ID: {patient.uniqueId}
              </p>
              <div className="flex gap-2 mt-1 text-xs">
                <Badge variant="secondary">{patient.rank}</Badge>
                <Badge variant="outline">{patient.sex}</Badge>
                <Badge variant="outline">{patient.ward}</Badge>
                <Badge variant="outline">Age: {patient.age}</Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TestTube className="h-4 w-4 text-medical-blue" />
            <Badge className="bg-medical-blue text-white">{test.type}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Test Data Entry Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-medical-blue" />
            Enter Test Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {renderDynamicFields()}
            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={!hasData || isLoading}
                className="bg-medical-success hover:bg-medical-success/90"
              >
                {isLoading ? "Saving Results..." : "Save Test Results"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestDataEntry;

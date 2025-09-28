import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface LabTest {
  id: string;
  name: string;
  description: string;
  category?: string;
}

interface Patient {
  id: string;
  name: string;
  uniqueId: string;
  age: string;
  sex: string;
  rank: string;
  ward: string;
}

interface LabTestField {
  id: string;
  lab_test_id: string;
  field_name: string;
  field_type: string;
  field_options: string[] | null;
  is_required: boolean;
  field_order: number;
  unit?: string | null;
}

interface LabManagementProps {
  patient?: Patient | null; // optional
}

const categories = [
  "Chemistry",
  "Hematology",
  "Microbiology",
  "Serology",
  "Radiology",
  "Uncategorized",
];

const LabManagement: React.FC<LabManagementProps> = ({ patient }) => {
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [selectedTest, setSelectedTest] = useState<LabTest | null>(null);
  const [testFields, setTestFields] = useState<LabTestField[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  // New test form
  const [newTestForm, setNewTestForm] = useState({
    name: "",
    description: "",
    category: "Uncategorized",
  });

  // New field form
  const [newFieldForm, setNewFieldForm] = useState({
    field_name: "",
    field_type: "text",
    field_options: "",
    is_required: false,
    unit: "",
  });

  useEffect(() => {
    loadLabTests();
  }, []);

  useEffect(() => {
    if (selectedTest) {
      loadTestFields(selectedTest.id);
    }
  }, [selectedTest]);

  const loadLabTests = async () => {
    try {
      const { data, error } = await supabase
        .from("lab_tests")
        .select("*")
        .order("name");

      if (error) throw error;
      setLabTests(data || []);
    } catch (error: any) {
      console.error("Error loading lab tests:", error);
      toast({
        title: "Error",
        description: "Failed to load lab tests.",
        variant: "destructive",
      });
    }
  };

  const loadTestFields = async (testId: string) => {
    try {
      const { data, error } = await supabase
        .from("lab_test_fields")
        .select("*")
        .eq("lab_test_id", testId)
        .order("field_order");

      if (error) throw error;

      setTestFields(data || []);
    } catch (error: any) {
      console.error("Error loading test fields:", error);
      toast({
        title: "Error",
        description: "Failed to load test fields.",
        variant: "destructive",
      });
    }
  };

  const handleCreateTest = async () => {
    if (!newTestForm.name.trim()) {
      toast({
        title: "Error",
        description: "Test name is required.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.from("lab_tests").insert({
        name: newTestForm.name.trim(),
        description: newTestForm.description.trim(),
        category: newTestForm.category,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Lab test created successfully.",
      });

      setNewTestForm({ name: "", description: "", category: "Uncategorized" });
      setIsDialogOpen(false);
      loadLabTests();
    } catch (error: any) {
      console.error("Error creating test:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create lab test.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddField = async () => {
    if (!selectedTest || !newFieldForm.field_name.trim()) {
      toast({
        title: "Error",
        description: "Field name is required.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const fieldOptions =
        newFieldForm.field_type === "dropdown" &&
        newFieldForm.field_options.trim()
          ? newFieldForm.field_options
              .split(",")
              .map((opt) => opt.trim())
              .filter((opt) => opt)
          : null;

      const { error } = await supabase.from("lab_test_fields").insert({
        lab_test_id: selectedTest.id,
        field_name: newFieldForm.field_name.trim(),
        field_type: newFieldForm.field_type,
        field_options: fieldOptions,
        is_required: newFieldForm.is_required,
        field_order: testFields.length + 1,
        unit: newFieldForm.unit || null,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Field added successfully.",
      });

      setNewFieldForm({
        field_name: "",
        field_type: "text",
        field_options: "",
        is_required: false,
        unit: "",
      });

      loadTestFields(selectedTest.id);
    } catch (error: any) {
      console.error("Error adding field:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add field.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteField = async (fieldId: string) => {
    try {
      const { error } = await supabase
        .from("lab_test_fields")
        .delete()
        .eq("id", fieldId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Field deleted successfully.",
      });

      if (selectedTest) {
        loadTestFields(selectedTest.id);
      }
    } catch (error: any) {
      console.error("Error deleting field:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete field.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Lab Tests Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-medical-blue">
                Lab Tests
              </CardTitle>
              <CardDescription>Manage available lab test types</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-medical-success hover:bg-medical-success/90">
                  <Plus className="w-4 h-4 mr-2" />
                  New Test
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Lab Test</DialogTitle>
                  <DialogDescription>
                    Add a new test type that can be assigned to patients.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="testName">Test Name *</Label>
                    <Input
                      id="testName"
                      placeholder="e.g., Blood Test, X-Ray"
                      value={newTestForm.name}
                      onChange={(e) =>
                        setNewTestForm((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="testDescription">Description</Label>
                    <Textarea
                      id="testDescription"
                      placeholder="Brief description of the test"
                      value={newTestForm.description}
                      onChange={(e) =>
                        setNewTestForm((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="testCategory">Category</Label>
                    <Select
                      value={newTestForm.category}
                      onValueChange={(value) =>
                        setNewTestForm((prev) => ({
                          ...prev,
                          category: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={handleCreateTest}
                    disabled={isLoading}
                    className="w-full bg-medical-success hover:bg-medical-success/90"
                  >
                    {isLoading ? "Creating..." : "Create Test"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {labTests.map((test) => (
              <div
                key={test.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedTest?.id === test.id
                    ? "bg-medical-blue/10 border-medical-blue"
                    : "bg-card hover:bg-muted/50"
                }`}
                onClick={() => setSelectedTest(test)}
              >
                <h4 className="font-medium">{test.name}</h4>
                {test.description && (
                  <p className="text-sm text-muted-foreground">
                    {test.description}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Category: {test.category || "Uncategorized"}
                </p>
              </div>
            ))}
            {labTests.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No lab tests available. Create your first test.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Test Fields Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold text-medical-blue">
            {selectedTest ? `${selectedTest.name} Fields` : "Test Fields"}
          </CardTitle>
          <CardDescription>
            {selectedTest
              ? "Manage form fields for this test type"
              : "Select a test to manage its fields"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedTest ? (
            <div className="space-y-6">
              {/* Add New Field Form */}
              <div className="space-y-4 p-4 bg-muted/20 rounded-lg">
                <h4 className="font-medium">Add New Field</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fieldName">Field Name *</Label>
                    <Input
                      id="fieldName"
                      placeholder="e.g., Hemoglobin"
                      value={newFieldForm.field_name}
                      onChange={(e) =>
                        setNewFieldForm((prev) => ({
                          ...prev,
                          field_name: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fieldType">Field Type</Label>
                    <Select
                      value={newFieldForm.field_type}
                      onValueChange={(value) =>
                        setNewFieldForm((prev) => ({
                          ...prev,
                          field_type: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="float">Float</SelectItem>
                        <SelectItem value="dropdown">Dropdown</SelectItem>
                        <SelectItem value="textarea">Textarea</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {newFieldForm.field_type === "dropdown" && (
                  <div className="space-y-2">
                    <Label htmlFor="fieldOptions">
                      Options (comma-separated)
                    </Label>
                    <Input
                      id="fieldOptions"
                      placeholder="e.g., Normal, Abnormal, Critical"
                      value={newFieldForm.field_options}
                      onChange={(e) =>
                        setNewFieldForm((prev) => ({
                          ...prev,
                          field_options: e.target.value,
                        }))
                      }
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="fieldUnit">Unit (optional)</Label>
                  <Input
                    id="fieldUnit"
                    placeholder="e.g., mg/dL, mmol/L"
                    value={newFieldForm.unit}
                    onChange={(e) =>
                      setNewFieldForm((prev) => ({
                        ...prev,
                        unit: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isRequired"
                    checked={newFieldForm.is_required}
                    onChange={(e) =>
                      setNewFieldForm((prev) => ({
                        ...prev,
                        is_required: e.target.checked,
                      }))
                    }
                    className="rounded"
                  />
                  <Label htmlFor="isRequired">Required field</Label>
                </div>

                <Button
                  onClick={handleAddField}
                  disabled={isLoading}
                  className="w-full bg-medical-success hover:bg-medical-success/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {isLoading ? "Adding..." : "Add Field"}
                </Button>
              </div>

              {/* Existing Fields */}
              <div className="space-y-3">
                <h4 className="font-medium">Existing Fields</h4>
                {testFields.map((field) => (
                  <div
                    key={field.id}
                    className="flex items-center justify-between p-3 bg-card rounded-lg border"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{field.field_name}</span>
                        <span className="text-xs bg-muted px-2 py-1 rounded">
                          {field.field_type}
                        </span>
                        {field.is_required && (
                          <span className="text-xs bg-medical-error/20 text-medical-error px-2 py-1 rounded">
                            Required
                          </span>
                        )}
                        {field.unit && (
                          <span className="text-xs bg-muted/30 px-2 py-1 rounded">
                            Unit: {field.unit}
                          </span>
                        )}
                      </div>
                      {/* <div className="flex items-center gap-2">
                        
                      </div> */}

                      {field.field_options && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Options: {field.field_options.join(", ")}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteField(field.id)}
                      className="text-medical-error hover:text-medical-error hover:bg-medical-error/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {testFields.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    No fields configured for this test.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Select a lab test from the left panel to manage its fields.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LabManagement;

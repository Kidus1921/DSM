import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus } from "lucide-react";
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

interface PatientRegistrationProps {
  onPatientRegistered: (patient: Patient) => void;
}

const PatientRegistration = ({ onPatientRegistered }: PatientRegistrationProps) => {
  const [formData, setFormData] = useState({
    name: "",
    uniqueId: "",
    age: "",
    sex: "",
    rank: "",
    ward: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [patientsWithSameId, setPatientsWithSameId] = useState<Patient[]>([]);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Fetch patients with the same uniqueId whenever uniqueId changes
  useEffect(() => {
    const fetchPatients = async () => {
      if (!formData.uniqueId) {
        setPatientsWithSameId([]);
        return;
      }
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .eq("unique_id", formData.uniqueId);

      if (!error && data) {
        setPatientsWithSameId(
          data.map((p: any) => ({
            id: p.id,
            name: p.name,
            uniqueId: p.unique_id,
            age: String(p.age),
            sex: p.sex,
            rank: p.rank,
            ward: p.ward,
          }))
        );
      } else {
        setPatientsWithSameId([]);
      }
    };
    fetchPatients();
  }, [formData.uniqueId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { data, error } = await supabase
      .from("patients")
      .insert([
        {
          name: formData.name,
          unique_id: formData.uniqueId,
          age: Number(formData.age),
          sex: formData.sex,
          rank: formData.rank,
          ward: formData.ward,
        }
      ])
      .select()
      .single();

    if (error) {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    const patient: Patient = {
      id: data.id,
      name: data.name,
      uniqueId: data.unique_id,
      age: String(data.age),
      sex: data.sex,
      rank: data.rank,
      ward: data.ward,
    };

    toast({
      title: "Patient Registered",
      description: `Successfully registered ${formData.name}`,
    });

    onPatientRegistered(patient);
    setIsLoading(false);
  };

  const handleSelectExistingPatient = (patient: Patient) => {
    onPatientRegistered(patient);
  };

  const isFormValid = formData.name && formData.uniqueId && formData.age && 
                     formData.sex && formData.rank && formData.ward;

  return (
    <Card className="shadow-lg border-2 border-blue-100">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-700">
          <UserPlus className="h-5 w-5 text-blue-500" />
          Patient Registration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Patient Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter full name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="uniqueId">Unique ID / Family ID *</Label>
              <Input
                id="uniqueId"
                value={formData.uniqueId}
                onChange={(e) => handleInputChange("uniqueId", e.target.value)}
                placeholder="Enter Unique or Family ID"
                required
              />
              {/* Show filtered users under this uniqueId */}
              {formData.uniqueId && patientsWithSameId.length > 0 && (
                <div className="mt-2 bg-blue-50 border border-blue-200 rounded p-2 text-sm">
                  <div className="font-semibold mb-1 text-blue-700">Users under this Unique ID:</div>
                  <ul className="list-disc pl-5">
                    {patientsWithSameId.map((p) => (
                      <li
                        key={p.id}
                        className="cursor-pointer hover:bg-blue-100 rounded px-2 py-1 transition"
                        onClick={() => handleSelectExistingPatient(p)}
                        title="Click to select this patient"
                      >
                        <span className="font-medium">{p.name}</span> ({p.age} yrs, {p.sex}, {p.rank}, {p.ward})
                      </li>
                    ))}
                  </ul>
                  <div className="text-xs text-blue-700 mt-2">
                    Click a user to proceed with this patient.
                  </div>
                </div>
              )}
            </div>
            {/* ...other fields... */}
            <div className="space-y-2">
              <Label htmlFor="age">Age *</Label>
              <Input
                id="age"
                type="number"
                min="0"
                value={formData.age}
                onChange={(e) => handleInputChange("age", e.target.value)}
                placeholder="Enter age"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sex">Sex *</Label>
              <Select value={formData.sex} onValueChange={(value) => handleInputChange("sex", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select sex" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rank">Rank *</Label>
              <Select value={formData.rank} onValueChange={(value) => handleInputChange("rank", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select rank" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Army">Army</SelectItem>
                  <SelectItem value="Army Family">Army Family</SelectItem>
                  <SelectItem value="Civil">Civil</SelectItem>
                  <SelectItem value="Pension">Pension</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ward">Ward *</Label>
              <Select value={formData.ward} onValueChange={(value) => handleInputChange("ward", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select ward" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPD">OPD</SelectItem>
                  <SelectItem value="Medical">Medical</SelectItem>
                  <SelectItem value="Gyn">Gyn</SelectItem>
                  <SelectItem value="Surgical">Surgical</SelectItem>
                  <SelectItem value="Pediatric">Pediatric</SelectItem>
                  <SelectItem value="Emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <Button 
              type="submit" 
              disabled={!isFormValid || isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow"
            >
              {isLoading ? "Processing..." : "Register Patient"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PatientRegistration;
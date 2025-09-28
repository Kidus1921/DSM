import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Test {
  id: number;
  patient_id: number;
  type: string;
  result: string;
  status: "pending" | "completed";
  created_at: string;
}

interface Patient {
  id: number;
  name: string;
  unique_id: string;
  age: number;
  ward: string;
  rank: string;
  tests: Test[];
}

const LabReport = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [filters, setFilters] = useState({ name: "", id: "", age: "", ward: "", rank: "" });

  useEffect(() => {
    const fetchPatients = async () => {
      // Fetch all patients
      const { data: patientsData, error: patientsError } = await supabase.from("patients").select("*");
      if (patientsError) {
        console.error("Error fetching patients:", patientsError.message);
        return;
      }

      // For each patient, fetch their tests
      const patientsWithTests = await Promise.all(
        patientsData!.map(async (p: any) => {
          const { data: testsData } = await supabase
            .from("tests")
            .select("*")
            .eq("patient_id", p.id);
          return { ...p, tests: testsData || [] };
        })
      );

      setPatients(patientsWithTests);
    };

    fetchPatients();
  }, []);

  const wards = Array.from(new Set(patients.map((p) => p.ward)));
  const ranks = Array.from(new Set(patients.map((p) => p.rank)));

  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      return (
        p.name.toLowerCase().includes(filters.name.toLowerCase()) &&
        p.unique_id.toLowerCase().includes(filters.id.toLowerCase()) &&
        p.age.toString().includes(filters.age) &&
        (filters.ward ? p.ward === filters.ward : true) &&
        (filters.rank ? p.rank === filters.rank : true)
      );
    });
  }, [patients, filters]);

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Lab Reports</h1>
        <Button onClick={() => navigate("/dashboard")} variant="outline" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Button>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              {["Name", "ID", "Age", "Ward", "Rank", "Tests", "Actions"].map((col) => (
                <th key={col} className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  {col}
                  {col === "Name" && (
                    <Input placeholder="Filter Name" className="mt-1 w-full text-sm" value={filters.name} onChange={(e) => handleFilterChange("name", e.target.value)} />
                  )}
                  {col === "ID" && (
                    <Input placeholder="Filter ID" className="mt-1 w-full text-sm" value={filters.id} onChange={(e) => handleFilterChange("id", e.target.value)} />
                  )}
                  {col === "Age" && (
                    <Input placeholder="Filter Age" className="mt-1 w-full text-sm" value={filters.age} onChange={(e) => handleFilterChange("age", e.target.value)} />
                  )}
                  {col === "Ward" && (
                    <Select value={filters.ward || "all"} onValueChange={(val) => handleFilterChange("ward", val === "all" ? "" : val)}>
                      <SelectTrigger className="mt-1 w-full"><SelectValue placeholder="All Wards" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        {wards.map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                  {col === "Rank" && (
                    <Select value={filters.rank || "all"} onValueChange={(val) => handleFilterChange("rank", val === "all" ? "" : val)}>
                      <SelectTrigger className="mt-1 w-full"><SelectValue placeholder="All Ranks" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        {ranks.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredPatients.length > 0 ? filteredPatients.map((p, idx) => (
              <tr key={p.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3">{p.unique_id}</td>
                <td className="px-4 py-3">{p.age}</td>
                <td className="px-4 py-3">{p.ward}</td>
                <td className="px-4 py-3">{p.rank}</td>
                <td className="px-4 py-3">{p.tests.length} tests</td>
                <td className="px-4 py-3">
                  <Button size="sm" variant="ghost" onClick={() => setSelectedPatient(p)}>
                    <Eye className="h-4 w-4" /> Details
                  </Button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={7} className="text-center py-4 text-gray-500">No patients found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={!!selectedPatient} onOpenChange={() => setSelectedPatient(null)}>
        <DialogContent className="max-w-4xl rounded-lg">
          <DialogHeader><DialogTitle>Patient Test Details</DialogTitle></DialogHeader>
          {selectedPatient && (
            <div className="space-y-4">
              <p className="text-lg font-semibold">{selectedPatient.name} (ID: {selectedPatient.unique_id})</p>
              <p className="text-gray-600">Age: {selectedPatient.age} | Ward: {selectedPatient.ward} | Rank: {selectedPatient.rank}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {selectedPatient.tests.map((test) => (
                  <div key={test.id} className="p-4 border-l-4 border-blue-500 rounded shadow-sm hover:shadow-md transition bg-white">
                    <h3 className="font-semibold text-blue-700">{test.type}</h3>
                    <p className="text-gray-700">Result: {test.result}</p>
                    <p className="text-gray-500 text-sm">Status: {test.status}</p>
                    <p className="text-gray-400 text-sm">Date: {test.created_at}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LabReport;

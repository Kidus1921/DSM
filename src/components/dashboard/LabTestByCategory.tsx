// src/components/dashboard/LabTestByCategory.tsx

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ReportRow {
  category: string;
  army: number;
  army_family: number;
  civil: number;
  pension: number;
  total: number;
}

const LabTestByCategory = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [report, setReport] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchReport = async () => {
    if (!startDate || !endDate) {
      toast({ title: "Error", description: "Please select both start and end dates", variant: "destructive" });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .rpc<ReportRow[], { start_date: string; end_date: string }>("lab_tests_by_category", {
          start_date: startDate,
          end_date: endDate,
        });

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        setReport(data || []);
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Something went wrong", variant: "destructive" });
    }

    setLoading(false);
  };

  const downloadCSV = () => {
    if (report.length === 0) return;

    const header = ["Category", "Army", "Army Family", "Civil", "Pension", "Total"];
    const rows = report.map(r => [r.category, r.army, r.army_family, r.civil, r.pension, r.total]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [header, ...rows].map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `lab_report_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Lab Tests by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-4">
          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="endDate">End Date</Label>
            <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <div className="flex items-end gap-2">
            <Button onClick={fetchReport} disabled={loading}>
              {loading ? "Loading..." : "Generate Report"}
            </Button>
            <Button onClick={downloadCSV} disabled={report.length === 0}>
              Download CSV
            </Button>
          </div>
        </div>

        {report.length > 0 ? (
          <table className="w-full border border-gray-200 rounded-md">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Category</th>
                <th className="p-2 text-left">Army</th>
                <th className="p-2 text-left">Army Family</th>
                <th className="p-2 text-left">Civil</th>
                <th className="p-2 text-left">Pension</th>
                <th className="p-2 text-left">Total</th>
              </tr>
            </thead>
            <tbody>
              {report.map((row, idx) => (
                <tr key={idx} className="border-t">
                  <td className="p-2">{row.category || "Uncategorized"}</td>
                  <td className="p-2">{row.army}</td>
                  <td className="p-2">{row.army_family}</td>
                  <td className="p-2">{row.civil}</td>
                  <td className="p-2">{row.pension}</td>
                  <td className="p-2">{row.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-muted-foreground mt-4">No results found for this date range.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default LabTestByCategory;

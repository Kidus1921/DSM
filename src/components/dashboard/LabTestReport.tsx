import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ReportRow {
  test_name: string;
  army: number;
  army_family: number;
  civil: number;
  pension: number;
  total: number;
}

const LabTestReport = () => {
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [report, setReport] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    try {
      setLoading(true);

      // Build query with optional date filter
      let query = supabase
        .from("tests")
        .select(
          `
          id,
          created_at,
          patients!inner(rank),
          lab_tests!inner(name)
        `
        );

      if (fromDate) {
        query = query.gte("created_at", fromDate);
      }
      if (toDate) {
        query = query.lte("created_at", toDate);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching report:", error);
        setLoading(false);
        return;
      }

      // Process into grouped counts
      const grouped: Record<string, ReportRow> = {};

      data?.forEach((row: any) => {
        const testName = row.lab_tests.name;
        const rank = row.patients.rank;

        if (!grouped[testName]) {
          grouped[testName] = {
            test_name: testName,
            army: 0,
            army_family: 0,
            civil: 0,
            pension: 0,
            total: 0,
          };
        }

        if (rank === "Army") grouped[testName].army++;
        if (rank === "Army Family") grouped[testName].army_family++;
        if (rank === "Civil") grouped[testName].civil++;
        if (rank === "Pension") grouped[testName].pension++;

        grouped[testName].total++;
      });

      setReport(Object.values(grouped));
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-run when page loads
  useEffect(() => {
    generateReport();
  }, []);

  return (
    <Card className="shadow-lg rounded-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Lab Test Report</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Date Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">From</label>
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">To</label>
            <Input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={generateReport} disabled={loading}>
              {loading ? "Generating..." : "Generate"}
            </Button>
          </div>
        </div>

        {/* Report Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Test Name</TableHead>
                <TableHead>Army</TableHead>
                <TableHead>Army Family</TableHead>
                <TableHead>Civil</TableHead>
                <TableHead>Pension</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report.map((row, i) => (
                <TableRow key={i}>
                  <TableCell>{row.test_name}</TableCell>
                  <TableCell>{row.army}</TableCell>
                  <TableCell>{row.army_family}</TableCell>
                  <TableCell>{row.civil}</TableCell>
                  <TableCell>{row.pension}</TableCell>
                  <TableCell>{row.total}</TableCell>
                </TableRow>
              ))}

              {/* Totals Row */}
              {report.length > 0 && (
                <TableRow className="font-bold bg-gray-100">
                  <TableCell>Total</TableCell>
                  <TableCell>
                    {report.reduce((sum, r) => sum + r.army, 0)}
                  </TableCell>
                  <TableCell>
                    {report.reduce((sum, r) => sum + r.army_family, 0)}
                  </TableCell>
                  <TableCell>
                    {report.reduce((sum, r) => sum + r.civil, 0)}
                  </TableCell>
                  <TableCell>
                    {report.reduce((sum, r) => sum + r.pension, 0)}
                  </TableCell>
                  <TableCell>
                    {report.reduce((sum, r) => sum + r.total, 0)}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default LabTestReport;

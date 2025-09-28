import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface LabSummaryRow {
  test_name: string;
  result: string;
  army: number;
  army_family: number;
  civil: number;
  pension: number;
  total: number;
}

const LabSummaryReport: React.FC = () => {
  const { toast } = useToast();
  const [summary, setSummary] = useState<LabSummaryRow[]>([]);
  const [totals, setTotals] = useState({
    army: 0,
    army_family: 0,
    civil: 0,
    pension: 0,
    total: 0,
  });

  const fetchLabSummary = async () => {
    try {
      const { data: testsData, error } = await supabase
        .from("tests")
        .select(`
          id,
          status,
          patient:patients(name, rank),
          lab_test:lab_tests(name),
          test_results(field_value)
        `)
        .eq("status", "completed");

      if (error) throw error;

      const rows: LabSummaryRow[] = [];

      testsData?.forEach((t: any) => {
        const test_name = t.lab_test?.name || "-";
        const patient_rank = t.patient?.rank || "-";

        if (t.test_results?.length > 0) {
          t.test_results.forEach((res: any) => {
            rows.push({
              test_name,
              result: res.field_value || "-",
              army: patient_rank === "Army" ? 1 : 0,
              army_family: patient_rank === "Army Family" ? 1 : 0,
              civil: patient_rank === "Civil" ? 1 : 0,
              pension: patient_rank === "Pension" ? 1 : 0,
              total: 1,
            });
          });
        } else {
          rows.push({
            test_name,
            result: "-",
            army: patient_rank === "Army" ? 1 : 0,
            army_family: patient_rank === "Army Family" ? 1 : 0,
            civil: patient_rank === "Civil" ? 1 : 0,
            pension: patient_rank === "Pension" ? 1 : 0,
            total: 1,
          });
        }
      });

      setSummary(rows);

      // Compute totals
      const totalCounts = rows.reduce(
        (acc, row) => {
          acc.army += row.army;
          acc.army_family += row.army_family;
          acc.civil += row.civil;
          acc.pension += row.pension;
          acc.total += row.total;
          return acc;
        },
        { army: 0, army_family: 0, civil: 0, pension: 0, total: 0 }
      );

      setTotals(totalCounts);
    } catch (err: any) {
      console.error("Error fetching lab summary:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to fetch lab summary",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchLabSummary();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lab Summary Report</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full table-auto border border-muted border-collapse">
            <thead>
              <tr className="bg-medical-blue/20">
                <th className="border px-2 py-1">#</th>
                <th className="border px-2 py-1">Laboratory Test</th>
                <th className="border px-2 py-1">Result</th>
                <th className="border px-2 py-1">Army</th>
                <th className="border px-2 py-1">Army Family</th>
                <th className="border px-2 py-1">Civil</th>
                <th className="border px-2 py-1">Pension</th>
                <th className="border px-2 py-1">Total</th>
              </tr>
            </thead>
            <tbody>
              {summary.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-4">
                    No lab tests completed yet.
                  </td>
                </tr>
              )}

              {summary.map((row, idx) => (
                <tr key={`${row.test_name}-${row.result}-${idx}`}>
                  <td className="border px-2 py-1">{idx + 1}</td>
                  <td className="border px-2 py-1">{row.test_name}</td>
                  <td className="border px-2 py-1">{row.result}</td>
                  <td className="border px-2 py-1">{row.army || "-"}</td>
                  <td className="border px-2 py-1">{row.army_family || "-"}</td>
                  <td className="border px-2 py-1">{row.civil || "-"}</td>
                  <td className="border px-2 py-1">{row.pension || "-"}</td>
                  <td className="border px-2 py-1">{row.total || "-"}</td>
                </tr>
              ))}

              {/* Totals row */}
              <tr className="font-bold bg-muted/20">
                <td className="border px-2 py-1" colSpan={3}>
                  Total
                </td>
                <td className="border px-2 py-1">{totals.army || "-"}</td>
                <td className="border px-2 py-1">{totals.army_family || "-"}</td>
                <td className="border px-2 py-1">{totals.civil || "-"}</td>
                <td className="border px-2 py-1">{totals.pension || "-"}</td>
                <td className="border px-2 py-1">{totals.total || "-"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default LabSummaryReport;

-- Create patients table
CREATE TABLE public.patients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  unique_id TEXT NOT NULL UNIQUE,
  age INTEGER NOT NULL CHECK (age > 0 AND age < 150),
  sex TEXT NOT NULL CHECK (sex IN ('Male', 'Female')),
  rank TEXT NOT NULL CHECK (rank IN ('Army', 'Army Family', 'Civil', 'Pension')),
  ward TEXT NOT NULL CHECK (ward IN ('OPD', 'Medical', 'Gynecology', 'Surgery', 'Pediatric', 'Orthopedic', 'Cardiology', 'Emergency')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lab_tests table (test templates)
CREATE TABLE public.lab_tests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lab_test_fields table (fields for each test type)
CREATE TABLE public.lab_test_fields (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lab_test_id UUID NOT NULL REFERENCES public.lab_tests(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  field_type TEXT NOT NULL CHECK (field_type IN ('text', 'number', 'dropdown', 'textarea')),
  field_options TEXT[], -- For dropdown options
  is_required BOOLEAN NOT NULL DEFAULT false,
  field_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tests table (assigned tests to patients)
CREATE TABLE public.tests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  lab_test_id UUID NOT NULL REFERENCES public.lab_tests(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create test_results table (actual test results)
CREATE TABLE public.test_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id UUID NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  field_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_test_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all operations for now - can be restricted later)
CREATE POLICY "Allow all operations on patients" ON public.patients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on lab_tests" ON public.lab_tests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on lab_test_fields" ON public.lab_test_fields FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on tests" ON public.tests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on test_results" ON public.test_results FOR ALL USING (true) WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON public.patients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lab_tests_updated_at
  BEFORE UPDATE ON public.lab_tests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tests_updated_at
  BEFORE UPDATE ON public.tests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some default lab tests
INSERT INTO public.lab_tests (name, description) VALUES
  ('Blood Test', 'Complete blood count and analysis'),
  ('X-Ray', 'Radiological examination'),
  ('Urine Test', 'Urinalysis and microscopy'),
  ('ECG', 'Electrocardiogram'),
  ('Ultrasound', 'Ultrasound examination');

-- Insert default fields for Blood Test
INSERT INTO public.lab_test_fields (lab_test_id, field_name, field_type, is_required, field_order) VALUES
  ((SELECT id FROM public.lab_tests WHERE name = 'Blood Test'), 'Hemoglobin', 'number', true, 1),
  ((SELECT id FROM public.lab_tests WHERE name = 'Blood Test'), 'WBC Count', 'number', true, 2),
  ((SELECT id FROM public.lab_tests WHERE name = 'Blood Test'), 'Platelet Count', 'number', true, 3),
  ((SELECT id FROM public.lab_tests WHERE name = 'Blood Test'), 'Blood Group', 'dropdown', false, 4);

-- Insert dropdown options for Blood Group
UPDATE public.lab_test_fields 
SET field_options = ARRAY['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
WHERE field_name = 'Blood Group';

-- Insert default fields for X-Ray
INSERT INTO public.lab_test_fields (lab_test_id, field_name, field_type, is_required, field_order) VALUES
  ((SELECT id FROM public.lab_tests WHERE name = 'X-Ray'), 'Chest Findings', 'textarea', true, 1),
  ((SELECT id FROM public.lab_tests WHERE name = 'X-Ray'), 'Bone Findings', 'textarea', false, 2),
  ((SELECT id FROM public.lab_tests WHERE name = 'X-Ray'), 'Overall Assessment', 'dropdown', true, 3);

-- Insert dropdown options for X-Ray Assessment
UPDATE public.lab_test_fields 
SET field_options = ARRAY['Normal', 'Abnormal', 'Requires Further Investigation']
WHERE field_name = 'Overall Assessment' AND lab_test_id = (SELECT id FROM public.lab_tests WHERE name = 'X-Ray');
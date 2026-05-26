const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase.from('parcelFlow').select('id, report_date').order('report_date', { ascending: false }).order('id', { ascending: true }).limit(1);
  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Success, data length:", data.length);
    if(data.length > 0) console.log("Sample:", data[0]);
  }
}
run();

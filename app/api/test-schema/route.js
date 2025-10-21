/**
 * Test endpoint to check database schema
 * GET /api/test-schema
 */
export async function GET(request) {
  try {
    // Test if we can connect to Supabase and check schema
    const { createClient } = await import('@supabase/supabase-js');
    
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return Response.json({ 
        error: 'Missing Supabase environment variables' 
      }, { status: 500 });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test query to check if body_parts column exists
    const { data, error } = await supabase
      .from('sketches')
      .select('id, title, body_parts')
      .limit(1);
    
    if (error) {
      return Response.json({ 
        error: 'Database query failed',
        details: error.message 
      }, { status: 500 });
    }
    
    return Response.json({ 
      success: true,
      message: 'Database schema is correct',
      sample_data: data 
    });
    
  } catch (error) {
    return Response.json({ 
      error: 'Test failed',
      details: error.message 
    }, { status: 500 });
  }
}

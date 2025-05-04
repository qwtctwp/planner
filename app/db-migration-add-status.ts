import { query } from './lib/db';

async function main() {
  try {
    console.log('Starting migration to add status field to assignments table...');
    
    // Check if status column already exists
    const checkResult = await query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'assignments'
      AND column_name = 'status'
    `);
    
    if (checkResult.rows.length === 0) {
      // Add status column to assignments table
      await query(`
        ALTER TABLE assignments
        ADD COLUMN status VARCHAR(20) DEFAULT 'todo'
      `);
      console.log('Successfully added status column to assignments table');
      
      // Update existing completed assignments to have 'done' status
      await query(`
        UPDATE assignments
        SET status = 'done'
        WHERE completed = true
      `);
      console.log('Successfully updated status for completed assignments');
      
      // Update existing non-completed assignments to have 'todo' status
      await query(`
        UPDATE assignments
        SET status = 'todo'
        WHERE completed = false AND status IS NULL
      `);
      console.log('Successfully updated status for non-completed assignments');
    } else {
      console.log('Status column already exists in assignments table');
    }
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

main(); 
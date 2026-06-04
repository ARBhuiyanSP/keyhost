const { pool } = require('../config/database');

async function debugCategories() {
    try {
        console.log('--- Debugging Display Categories ---');
        const [categories] = await pool.execute(`
            SELECT dc.*, COUNT(DISTINCT p.id) as property_count
            FROM display_categories dc
            LEFT JOIN display_category_properties dcp ON dc.id = dcp.display_category_id
            LEFT JOIN properties p ON dcp.property_id = p.id AND p.status = 'active'
            WHERE dc.is_active = 1
            GROUP BY dc.id
            HAVING property_count > 0
            ORDER BY dc.sort_order ASC, dc.name ASC
        `);
        
        console.log('Active Categories found:', categories.length);
        for (const cat of categories) {
            console.log(`- Category: ${cat.name} (ID: ${cat.id}), Count: ${cat.property_count}`);
            const [props] = await pool.query(`
                SELECT p.id, p.title, p.status, p.property_type
                FROM properties p
                JOIN display_category_properties dcp ON p.id = dcp.property_id
                WHERE dcp.display_category_id = ? AND p.status = 'active'
            `, [cat.id]);
            console.log(`  Properties:`, props.map(p => ({ id: p.id, status: p.status, type: p.property_type })));
        }
        
    } catch (error) {
        console.error('Error during debugging:', error);
    } finally {
        await pool.end();
    }
}

debugCategories();

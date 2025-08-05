import db from '../src/config/database';
import bcrypt from 'bcryptjs';

async function initializeDatabase() {
  try {
    console.log('🔄 Initializing database...');

    // Run migrations
    await db.migrate.latest();
    console.log('✅ Database migrations completed');

    // Check if admin user exists
    const adminExists = await db('users').where('email', 'admin@audit.system').first();
    
    if (!adminExists) {
      // Create default admin user
      const passwordHash = await bcrypt.hash('admin123', 12);
      
      await db('users').insert({
        email: 'admin@audit.system',
        password_hash: passwordHash,
        first_name: 'System',
        last_name: 'Administrator',
        role: 'director',
        status: 'active',
        department: 'Internal Audit'
      });
      
      console.log('✅ Default admin user created');
      console.log('   Email: admin@audit.system');
      console.log('   Password: admin123');
      console.log('   ⚠️  Please change the password after first login!');
    }

    // Create sample audit plan for current year
    const currentYear = new Date().getFullYear();
    const planExists = await db('audit_plans').where('year', currentYear).first();
    
    if (!planExists) {
      const admin = await db('users').where('email', 'admin@audit.system').first();
      
      await db('audit_plans').insert({
        title: `${currentYear} Annual Audit Plan`,
        description: 'Comprehensive risk-based audit plan covering key organizational areas',
        year: currentYear,
        created_by: admin.id,
        status: 'approved',
        approved_by: admin.id,
        approved_date: new Date()
      });
      
      console.log(`✅ Sample audit plan created for ${currentYear}`);
    }

    // Create sample risk assessment
    const riskExists = await db('risk_assessments').count('* as count').first();
    
    if (riskExists && Number(riskExists.count) === 0) {
      const admin = await db('users').where('email', 'admin@audit.system').first();
      
      await db('risk_assessments').insert([
        {
          title: 'Financial Reporting Risk Assessment',
          description: 'Assessment of risks related to financial reporting processes',
          area_assessed: 'Financial Reporting',
          inherent_risk_score: 8,
          residual_risk_score: 5,
          risk_level: 'medium',
          risk_factors: 'Complex transactions, manual processes, limited segregation of duties',
          controls_identified: 'Monthly reconciliations, supervisor reviews, independent verification',
          assessed_by: admin.id,
          assessment_date: new Date(),
          next_review_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
        },
        {
          title: 'IT Security Risk Assessment',
          description: 'Assessment of information technology security risks',
          area_assessed: 'Information Technology',
          inherent_risk_score: 9,
          residual_risk_score: 6,
          risk_level: 'high',
          risk_factors: 'External threats, system complexity, user access management',
          controls_identified: 'Firewalls, access controls, security monitoring, regular updates',
          assessed_by: admin.id,
          assessment_date: new Date(),
          next_review_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        }
      ]);
      
      console.log('✅ Sample risk assessments created');
    }

    console.log('🎉 Database initialization completed successfully!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  } finally {
    await db.destroy();
  }
}

// Run initialization
initializeDatabase().catch(console.error);
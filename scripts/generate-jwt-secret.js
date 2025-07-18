const crypto = require('crypto');

function generateJWTSecret() {
  const secret = crypto.randomBytes(32).toString('hex');
  console.log('🔐 Generated JWT Secret:');
  console.log(secret);
  console.log('\n📋 Copy this value to your environment variables:');
  console.log(`JWT_SECRET=${secret}`);
  console.log('\n⚠️  Keep this secret secure and never commit it to version control!');
}

generateJWTSecret();

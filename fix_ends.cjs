const fs = require('fs');

['LoginForm', 'RegisterPatientForm', 'RegisterPhysioForm'].forEach(name => {
  let content = fs.readFileSync(`src/components/login/${name}.tsx`, 'utf8');
  
  // They all end with:
  // </main>
  // </>
  // );
  // }
  // We just need to make sure they are valid JSX.
  // Actually, wait, the beginning of the return is:
  // return (
  //  <>
  //    <main>...</main>
  //  </>
  // );
  // So it shouldn't be invalid if it matches.
  // Let's print out the exact return block for LoginForm.
  const returnIndex = content.lastIndexOf('return (');
  console.log(`\n\n--- ${name} ---`);
  console.log(content.substring(returnIndex));
  
  // The error was that `LoginForm` had:
  // return (
  // <div className="...">
  // {/* 1... */}
  // <main>...</main>
  // </>
  // );
  // Ah, the first file had `<div className="...">` from my regex replace gone wrong!
});

/**
 * One deterministic cast, shared by every product's aliasing pass.
 *
 * The same real person gets the same synthetic identity in every app, so a
 * reader moving between two work pages sees a consistent fictional company
 * rather than two unrelated sets of strangers.
 */

const FIRST = [
  "Aarav", "Ananya", "Rehan", "Meera", "Kabir", "Divya", "Arjun", "Nisha",
  "Vikas", "Pooja", "Siddharth", "Ritu", "Aman", "Shalini", "Karan", "Neha",
  "Yash", "Tanya", "Nikhil", "Priya", "Rahul", "Sneha", "Varun", "Kavya",
  "Manav", "Ishita", "Devika", "Anjali", "Raghu", "Bhavna", "Sameer", "Lata",
  "Farhan", "Ayesha", "Gautam", "Charu", "Imran", "Sarita", "Naveen", "Trisha",
  "Ojas", "Vaishali", "Zoya", "Harsh", "Ira", "Jatin", "Kiran", "Lavanya",
];

const LAST = [
  "Iyer", "Menon", "Rao", "Bhatia", "Sinha", "Kulkarni", "Nair", "Deshmukh",
  "Chawla", "Pillai", "Sethi", "Bora", "Grewal", "Mahajan", "Vora", "Salvi",
];

/** The nth person always gets the same name. */
export function identity(n) {
  const first = FIRST[n % FIRST.length];
  const last = LAST[(n * 7 + Math.floor(n / FIRST.length)) % LAST.length];
  return { name: `${first} ${last}`, first, last };
}

/**
 * Build name and email maps for a set of real identities.
 * Emails land on `.example`, which RFC 2606 reserves precisely for this.
 */
export function castFor(realNames, realEmails = []) {
  const names = new Map();
  const emails = new Map();
  const handles = new Set();

  for (const real of realNames) {
    if (names.has(real)) continue;
    names.set(real, identity(names.size).name);
  }

  for (const real of realEmails) {
    if (emails.has(real)) continue;
    const id = identity(emails.size);
    let handle = id.first.toLowerCase();
    let n = 2;
    while (handles.has(handle)) handle = `${id.first}.${id.last}${n++}`.toLowerCase();
    handles.add(handle);
    emails.set(real, `${handle}@northwind.example`);
  }

  return { names, emails };
}

/** Longest key first, so "Anita Rege Kumar" wins over "Anita Rege". */
export const byLength = (a, b) => b[0].length - a[0].length;

/** Word-boundary first-name pass, minus tokens that are ordinary words here. */
export function firstNamePairs(nameMap, notNames = []) {
  const skip = new Set(["meet", "dev", "open", "group", "home", ...notNames]);
  const out = new Map();
  for (const [real, fake] of nameMap) {
    const [rf] = real.split(" ");
    const [ff] = fake.split(" ");
    if (rf.length < 4 || skip.has(rf.toLowerCase())) continue;
    if (!out.has(rf)) out.set(rf, ff);
  }
  return [...out.entries()]
    .sort(byLength)
    .map(([from, to]) => [new RegExp(`\\b${from}\\b`, "g"), to]);
}

Frontend additional packages (for animations and shadcn-style components)

Run from the frontend folder:

npm install framer-motion clsx lucide-react

Optional (for Radix primitives / shadcn advanced patterns):
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu

After installing, run the dev server:

npm run dev

Notes:
- The UI components in src/ui use framer-motion and clsx. If you prefer Radix for accessible primitives, install the optional packages and adapt Modal/Dialog components.
- Tailwind must be installed and configured (scaffold provided a basic config). If Tailwind classes don't apply, ensure you run a full install including tailwind and postcss.

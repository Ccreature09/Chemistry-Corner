import { Navbar } from "@/components/functional/navbar";
import { Footer } from "@/components/functional/footer";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import Link from "next/link";
export default function Page() {
  return (
    <>
      <Navbar></Navbar>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 m-10">
        <Link href={"/games/grade-8"}>
          <Card>
            <CardTitle className="text-center m-5">8 клас</CardTitle>
            <CardContent></CardContent>
          </Card>
        </Link>
        <Link href={"/games/grade-9"}>
          <Card>
            <CardTitle className="text-center m-5">9 клас</CardTitle>
            <CardContent></CardContent>
          </Card>
        </Link>
        <Link href={"/games/grade-10"}>
          <Card>
            <CardTitle className="text-center m-5">10 клас</CardTitle>
            <CardContent></CardContent>
          </Card>
        </Link>
      </div>
      <Footer></Footer>
    </>
  );
}

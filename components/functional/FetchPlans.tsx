import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Skeleton } from "../ui/skeleton";
import Link from "next/link";
import Image from "next/image";
interface Plan {
  name: string;
  mainPicture: string;
  images: string[];
}
const FetchPlans: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    const fetchPlans = async () => {
      const plansRef = collection(db, "plans");
      const querySnapshot = await getDocs(plansRef);

      const plansList: Plan[] = [];
      querySnapshot.forEach((doc) => {
        const plan = doc.data() as Plan;
        plansList.push(plan);
      });

      setPlans(plansList);
    };

    fetchPlans();
  }, []);

  return (
    <>
      <p className="text-center text-6xl font-bold my-3"> Планове</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 mx-10">
        {plans.length > 0
          ? plans.map((plan, index) => (
              <Card key={index}>
                <Link href={`/plans/plan/${encodeURIComponent(plan.name)}`}>
                  <CardTitle className="text-center m-5">{plan.name}</CardTitle>
                  <CardContent>
                    <Image
                      src={plan.mainPicture}
                      alt={"plan"}
                      width={400}
                      height={200}
                      className="rounded"
                    />
                  </CardContent>
                </Link>
              </Card>
            ))
          : Array.from(
              { length: 4 },
              (
                _,
                index // Adjust the length for skeleton placeholders
              ) => <Skeleton key={index} className="w-[450px] h-[500px]" />
            )}
      </div>
    </>
  );
};

export default FetchPlans;

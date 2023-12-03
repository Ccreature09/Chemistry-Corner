"use client";
import React from "react";
import { Navbar } from "@/components/functional/navbar";
import { Footer } from "@/components/functional/footer";
import Link from "next/link";
export default function Home() {
  return (
    <>
      <Navbar />
      <section className=" p-8 text-black">
        <div className=" mx-auto">
          <h1 className="text-2xl text-green-500 md:text-4xl lg:text-6xl lg:container font-bold text-center mb-4">
            Добре дошли в Chem Magic - Вашият Портал към Света на Химията!
          </h1>
          <p className="text-base md:text-lg  text-center">
            Интересувате се от елементите, които съставят нашия свят или сте
            зачаровани от мистериите на химичните реакции? <br /> Chem Magic е
            вашият окончателен път към разгадаване на завладяващия свят на
            химията!
          </p>
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Link href={"/blog"}>
              <div className="p-4 hover:bg-blue-100 rounded-lg">
                <h2 className="text-4xl md:text-3xl lg:text-4xl font-semibold text-blue-500 mb-4">
                  Блог
                </h2>
                <p className="text-sm md:text-base">
                  Заплъвайте в нашата колекция от информативни и увлекателни
                  статии, които обхващат широка гама химични теми. От основи до
                  напреднали концепции, блогът ни предоставя ценни насоки за
                  учениците на всички нива.
                </p>
              </div>
            </Link>
            <Link href={"/comics"}>
              <div className="p-4 hover:bg-blue-100 rounded-lg">
                <h2 className="text-4xl md:text-3xl lg:text-4xl font-semibold text-blue-500 mb-4">
                  Комикси
                </h2>
                <p className="text-sm md:text-base">
                  Изследвайте по-леката страна на химията с нашия раздел с
                  комикси. Тези забавни и образователни комикси правят ученето
                  на химия лесно и ви подаряват усмивка.
                </p>
              </div>
            </Link>
            <div className="p-4">
              <h2 className="text-4xl md:text-3xl lg:text-4xl font-semibold text-blue-500 mb-4">
                Забавни Задачи
              </h2>
              <p className="text-sm md:text-base">
                Предизвикайте себе си с избор от забавни и предизвикателни
                химични задачи. Заточете уменията си за решаване на задачи, като
                си набавите доза забавление.
              </p>
            </div>
            <div className="p-4">
              <h2 className="text-4xl md:text-3xl lg:text-4xl font-semibold text-blue-500 mb-4">
                Тестове
              </h2>
              <p className="text-sm md:text-base">
                Поставете знанията си на изпитание с нашите химични тестове и
                викторини. Независимо дали сте ученик, който се подготвя за
                изпити или просто искате да разширите познанията си, нашите
                тестове са страхотен начин да измерите разбирането си.
              </p>
            </div>
            <Link href={"/periodic-table"}>
              <div className="p-4 hover:bg-blue-100 rounded-lg">
                <h2 className="text-4xl md:text-3xl lg:text-4xl font-semibold text-blue-500 mb-4">
                  Периодична Таблица
                </h2>
                <p className="text-sm md:text-base">
                  Открийте периодичната таблица като никога досега. Нашата
                  интерактивна периодична таблица предоставя подробна информация
                  за всеки химичен елемент. От атомния номер до свойствата и
                  обичайните приложения, тя е вашето едно място ресурс.
                </p>
              </div>
            </Link>

            <Link href={"/quiz"}>
              <div className="p-4 hover:bg-blue-100 rounded-lg">
                <h2 className="text-4xl md:text-3xl lg:text-4xl font-semibold text-blue-500 mb-4">
                  Quiz
                </h2>
                <p className="text-sm md:text-base">
                  Участвайте в Интересен Quiz, в който се съзтезавате срещу
                  приятелите ви за точки!
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}

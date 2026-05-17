-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "app";

-- CreateEnum
CREATE TYPE "app"."Prioridade" AS ENUM ('ALTA', 'MEDIA', 'BAIXA');

-- CreateEnum
CREATE TYPE "app"."AtributoRecompensa" AS ENUM ('FOCO', 'DISCIPLINA', 'INTELECTO', 'FORCA', 'CONSISTENCIA');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."HeroPerfil" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "foco" INTEGER NOT NULL DEFAULT 0,
    "disciplina" INTEGER NOT NULL DEFAULT 0,
    "intelecto" INTEGER NOT NULL DEFAULT 0,
    "forca" INTEGER NOT NULL DEFAULT 0,
    "consistencia" INTEGER NOT NULL DEFAULT 0,
    "nivelAtual" INTEGER NOT NULL DEFAULT 1,
    "xpAtual" INTEGER NOT NULL DEFAULT 0,
    "xpProximoNivel" INTEGER NOT NULL DEFAULT 100,
    "itemAvatarId" TEXT,
    "tituloId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HeroPerfil_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."Missao" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "prioridade" "app"."Prioridade" NOT NULL DEFAULT 'MEDIA',
    "atributoRecompensa" "app"."AtributoRecompensa" NOT NULL DEFAULT 'FOCO',
    "concluida" BOOLEAN NOT NULL DEFAULT false,
    "concluidaEm" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Missao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."MicroPasso" (
    "id" TEXT NOT NULL,
    "missaoId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "concluido" BOOLEAN NOT NULL DEFAULT false,
    "concluidoEm" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MicroPasso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."Conquista" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "missaoId" TEXT,
    "titulo" TEXT NOT NULL,
    "xpGanho" INTEGER NOT NULL,
    "atributoGanho" "app"."AtributoRecompensa" NOT NULL,
    "nivelAposConquista" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Conquista_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "HeroPerfil_userId_key" ON "app"."HeroPerfil"("userId");

-- AddForeignKey
ALTER TABLE "app"."HeroPerfil" ADD CONSTRAINT "HeroPerfil_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."Missao" ADD CONSTRAINT "Missao_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."MicroPasso" ADD CONSTRAINT "MicroPasso_missaoId_fkey" FOREIGN KEY ("missaoId") REFERENCES "app"."Missao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."Conquista" ADD CONSTRAINT "Conquista_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."Conquista" ADD CONSTRAINT "Conquista_missaoId_fkey" FOREIGN KEY ("missaoId") REFERENCES "app"."Missao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

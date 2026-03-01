-- CreateTable
CREATE TABLE "task_status_history" (
    "id" SERIAL NOT NULL,
    "task_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "entered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "exited_at" TIMESTAMP(3),
    "duration_seconds" INTEGER,
    "entered_by_user_id" INTEGER,
    "organization_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "task_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "task_status_history_task_id_idx" ON "task_status_history"("task_id");

-- CreateIndex
CREATE INDEX "task_status_history_status_idx" ON "task_status_history"("status");

-- CreateIndex
CREATE INDEX "task_status_history_entered_at_idx" ON "task_status_history"("entered_at");

-- CreateIndex
CREATE INDEX "task_status_history_organization_id_idx" ON "task_status_history"("organization_id");

-- AddForeignKey
ALTER TABLE "task_status_history" ADD CONSTRAINT "task_status_history_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_status_history" ADD CONSTRAINT "task_status_history_entered_by_user_id_fkey" FOREIGN KEY ("entered_by_user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

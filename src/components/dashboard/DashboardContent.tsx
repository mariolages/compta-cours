import { WelcomeCard } from "./WelcomeCard";
import { SearchBar } from "./SearchBar";
import { SubjectsGrid } from "./SubjectsGrid";
import { ClassesGrid } from "./ClassesGrid";
import { RecentFiles } from "./RecentFiles";
import type { File } from "@/types/files";
import type { Subject } from "@/types/subject";
import type { Class } from "@/types/class";

interface DashboardContentProps {
  selectedClassId: number | null;
  subjects: Subject[];
  classes: Class[];
  files: File[];
  searchQuery: string;
  lastRefresh: Date;
  onSearchChange: (value: string) => void;
  onSubjectClick: (subjectId: number) => void;
  onClassClick: (classId: number) => void;
  onDeleteFile: (fileId: string) => Promise<void>;
}

export const DashboardContent = ({
  selectedClassId,
  subjects,
  classes,
  files,
  searchQuery,
  lastRefresh,
  onSearchChange,
  onSubjectClick,
  onClassClick,
  onDeleteFile,
}: DashboardContentProps) => {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8 max-w-7xl pt-20">
      <WelcomeCard lastRefresh={lastRefresh} />
      
      {selectedClassId ? (
        <>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <SearchBar
              value={searchQuery}
              onChange={onSearchChange}
            />
          </div>

          {subjects && subjects.length > 0 ? (
            <SubjectsGrid 
              subjects={subjects} 
              onSubjectClick={onSubjectClick}
            />
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Aucune matière n'est disponible pour cette classe.</p>
            </div>
          )}
          
          <RecentFiles
            files={files}
            searchQuery={searchQuery}
            onDelete={onDeleteFile}
          />
        </>
      ) : (
        <ClassesGrid 
          classes={classes}
          onClassClick={onClassClick}
        />
      )}
    </div>
  );
};